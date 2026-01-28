const Course = require("../../../models/lecturer/courses.Model");
const User = require("../../../models/users/user.Model");
const { uploadImageBufferToCloudinary } = require("../../../utils/CloudinaryBufferUploader");

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
  try {
    // Validate that an image file was uploaded
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "file is missing" });
    }

    // Get lecturer ID from auth middleware
    const lecturerId = req.userInfo?.id;

    // Extract course details from request body
    const { title, category, institution, description, level, courseCode } =
      req.body || {};

    // Validate all required fields are present
    if (!title || !category || !institution || !level || !courseCode) {
      return res
        .status(400)
        .json({
          success: false,
          message: "missing fields all fields are required",
        });
    }

    // Verify the lecturer exists in the database
    const user = await User.findById(lecturerId);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "user do not exist" });
    }

    // Upload course image to Cloudinary
    const result = await uploadImageBufferToCloudinary(req.file.buffer);
    if (!result) {
      return res
        .status(400)
        .json({ success: false, message: "image upload failed" });
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

    return res
      .status(201)
      .json({
        success: true,
        message: "course created succesfully",
        course: newCourse,
      });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A course with this course code already exists",
        error: "DuplicateCourseCode"
      });
    }

    console.error("Create course error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error during course creation" });
  }
};

module.exports = createCourseHandler;

