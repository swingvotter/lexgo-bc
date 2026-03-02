const mongoose = require("mongoose");
const path = require('../../../../path');
const User = require(path.models.users.user);
const Course = require(path.models.lecturer.course);
const Resource = require(path.models.lecturer.resource);
const ResourceContent = require(path.models.lecturer.resourceContent);
const {
  uploadPdfBufferToCloudinary,
} = require(path.utils.cloudinaryUploader);
const cloudinary = require(path.config.cloudinary);
const cloudinaryUrlSigner = require(path.utils.cloudinaryUrlSigner);
const removeNewlines = require(path.utils.newLineRemover);
const textExtractor = require(path.utils.textExtractor);
const checkCourseAccess = require(path.utils.checkCourseAccess);
const AppError = require(path.error.appError);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

/**
 * Upload a PDF resource to a course
 * 
 * @route POST /api/Courses/resource/:courseId
 * @access Private - Requires authentication (lecturer or sub-lecturer)
 * 
 * @description Uploads a PDF file to Cloudinary, extracts its text content,
 * and stores both the file metadata and extracted content in the database.
 * This content can later be used for AI-powered course material generation.
 * 
 * @param {string} req.params.courseId - The course ID to attach the resource to
 * @param {Object} req.file - PDF file (required, handled by multer)
 */
const uploadResourceHandler = async (req, res) => {
  const session = await mongoose.startSession();
  const { courseId } = req.params;

  if (!courseId) {
    logger.warn("Resource missing course");
    throw new AppError("courseId is required", 400);
  }

  if (!req.file) {
    logger.warn("Resource missing file", { courseId });
    throw new AppError("file is missing", 400);
  }

  const lecturerId = req.userInfo.id;

  // Check if user has access to this course (owner or sub-lecturer)
  const { hasAccess, course } = await checkCourseAccess(courseId, lecturerId);

  if (!course) {
    logger.warn("Resource course missing", { courseId, lecturerId });
    throw new AppError("course not found", 404);
  }

  if (!hasAccess) {
    logger.warn("Resource denied", { courseId, lecturerId });
    throw new AppError("You do not have access to this course", 403);
  }

  // Upload PDF to Cloudinary as a private raw file
  const result = await uploadPdfBufferToCloudinary(req.file.buffer);
  if (!result) {
    logger.warn("Resource upload failed", { courseId, lecturerId });
    throw new AppError("upload failed", 400);
  }

  // Extract text content from the file for AI processing
  const data = await textExtractor(req.file);
  const updatedContent = removeNewlines(data);
  let newResource;

  await session.withTransaction(async () => {
    // Create resource record in database
    [newResource] = await Resource.create([{
      lecturerId,
      courseId: course._id,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileExtension: req.file.mimetype,
      publicId: result.public_id,
    }], { session });

    // Store extracted text content for AI course material generation
    await ResourceContent.create([{
      resourceId: newResource._id,
      courseId: course._id,
      content: updatedContent,
    }], { session });
  }).finally(() => session.endSession());

  logger.info("Resource uploaded", { courseId, resourceId: newResource?._id, lecturerId });
  return res.status(201).json({
    success: true,
    message: "resource uploaded succesfully",
    resourceId: newResource._id,
  });
};

module.exports = asyncHandler(uploadResourceHandler);

