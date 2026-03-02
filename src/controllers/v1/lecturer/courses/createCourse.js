const path = require('../../../../path');
const Course = require(path.models.lecturer.course);
const User = require(path.models.users.user);
const { uploadImageBufferToCloudinary } = require(path.utils.cloudinaryUploader);
const AppError = require(path.error.appError);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

/**
 * Create a new course
 * 
 * @route POST /api/Courses
 * @access Private - Requires authentication (lecturer only)
 * 
 * @description Creates a new course with an image uploaded to Cloudinary.
 * The course is associated with the authenticated lecturer.
 * 
 * @param {Object} req.file - Course image file (required, handled by multer)
 * @param {Object} req.body - Course details
 * @param {string} req.body.title - Course title (required)
 * @param {string} req.body.category - Course category (required)
 * @param {string} req.body.institution - Institution name (required)
 * @param {string} req.body.level - Course level (required)
 * @param {string} req.body.courseCode - Unique course code (required)
 * @param {string} [req.body.description] - Course description (optional)
 */
const createCourseHandler = async (req, res) => {
  // Validate that an image file was uploaded
  if (!req.file) {
    logger.warn("Course missing file");
    throw new AppError("file is missing", 400);
  }

  // Get lecturer ID from auth middleware
  const lecturerId = req.userInfo?.id;

  // Extract course details from request body
  const { title, category, institution, description, level, courseCode } =
    req.body || {};

  // Validate all required fields are present
  if (!title || !category || !institution || !level || !courseCode) {
    logger.warn("Course missing fields", { lecturerId });
    throw new AppError("missing fields all fields are required", 400);
  }

  // Verify the lecturer exists in the database
  const user = await User.findById(lecturerId);
  if (!user) {
    logger.warn("Course lecturer missing", { lecturerId });
    throw new AppError("user do not exist", 400);
  }

  const existingCourse = await Course.findOne({ courseCode });
  if (existingCourse) {
    logger.warn("Course code exists", { courseCode, lecturerId });
    throw new AppError("A course with this course code already exists", 409);
  }

  // Upload course image to Cloudinary
  const result = await uploadImageBufferToCloudinary(req.file.buffer);
  if (!result) {
    logger.warn("Course image upload failed", { lecturerId });
    throw new AppError("image upload failed", 400);
  }

  // Create new course in database with Cloudinary image URL
  const newCourse = await Course.create({
    lecturerId,
    title,
    courseImageUrl: result.secure_url,      // Public URL for the image
    coursePublicImageId: result.public_id,  // Cloudinary ID for deletion
    category,
    courseCode,
    institution,
    description,
    level,
  });

  logger.info("Course created", { courseId: newCourse?._id, lecturerId });
  return res
    .status(201)
    .json({
      success: true,
      message: "course created succesfully",
      course: newCourse,
    });
};

module.exports = asyncHandler(createCourseHandler);

