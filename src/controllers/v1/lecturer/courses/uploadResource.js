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
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({ success: false, message: "courseId is required" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "file is missing" });
    }

    const lecturerId = req.userInfo.id;

    // Check if user has access to this course (owner or sub-lecturer)
    const { hasAccess, course } = await checkCourseAccess(courseId, lecturerId);

    if (!course) {
      return res.status(404).json({ success: false, message: "course not found" });
    }

    if (!hasAccess) {
      return res.status(403).json({ success: false, message: "You do not have access to this course" });
    }

    // Upload PDF to Cloudinary as a private raw file
    const result = await uploadPdfBufferToCloudinary(req.file.buffer);
    if (!result) {
      return res.status(400).json({ success: false, message: "upload failed" });
    }

    // Extract text content from the file for AI processing
    const data = await textExtractor(req.file);
    const updatedContent = removeNewlines(data);

    // --- Start Database Transaction ---
    session.startTransaction();

    // Create resource record in database
    const [newResource] = await Resource.create([{
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

    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: "resource uploaded succesfully",
      resourceId: newResource._id,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error("Upload resource error:", error);
    return res.status(500).json({ success: false, message: "server error" });
  } finally {
    session.endSession();
  }
};

module.exports = uploadResourceHandler;

