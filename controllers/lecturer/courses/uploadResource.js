const User = require("../../../models/users/user.Model");
const Course = require("../../../models/lecturer/courses.Model");
const Resource = require("../../../models/lecturer/resource");
const ResourceContent = require("../../../models/lecturer/resourceContent");
const {
  uploadPdfBufferToCloudinary,
} = require("../../../utils/CloudinaryBufferUploader");
const cloudinary = require("../../../config/cloudinary");
const cloudinaryUrlSigner = require("../../../utils/cloudinaryUrlSigner");
const removeNewlines = require("../../../utils/newLineRemover");
const textExtractor = require("../../../utils/textExtractor");

/**
 * Upload a PDF resource to a course
 * 
 * @route POST /api/Courses/resource/:courseId
 * @access Private - Requires authentication (lecturer only)
 * 
 * @description Uploads a PDF file to Cloudinary, extracts its text content,
 * and stores both the file metadata and extracted content in the database.
 * This content can later be used for AI-powered course material generation.
 * 
 * @param {string} req.params.courseId - The course ID to attach the resource to
 * @param {Object} req.file - PDF file (required, handled by multer)
 */
const uploadResourceHandler = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Validate courseId is provided
    if (!courseId) {
      return res
        .status(400)
        .json({ success: false, message: "courseId is missing" });
    }

    // Validate file was uploaded
    if (!req.file) {
      return res
        .status(404)
        .json({ success: false, message: "file is missing" });
    }

    // Get lecturer ID from auth middleware
    const lecturerId = req.userInfo.id;

    // Verify lecturer exists
    const user = await User.findById(lecturerId);

    // Verify course exists AND belongs to this lecturer (authorization check)
    const course = await Course.findOne({ _id: courseId, lecturerId });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "lecturer not found" });
    }

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "course not found" });
    }

    // Upload PDF to Cloudinary as a private raw file
    const result = await uploadPdfBufferToCloudinary(req.file.buffer);
    if (!result) {
      return res
        .status(400)
        .json({ success: false, message: "course do not exist" });
    }

    // Extract text content from the file for AI processing
    const data = await textExtractor(req.file);

    // Create resource record in database
    const newResource = await Resource.create({
      lecturerId,
      courseId: course._id,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileExtension: req.file.mimetype,
      publicId: result.public_id,
    });



    // Clean up extracted text (remove excessive newlines)
    const updatedContent = removeNewlines(data);

    // Store extracted text content for AI course material generation
    await ResourceContent.create({
      resourceId: newResource._id,
      courseId: course._id,
      content: updatedContent,
    });

    return res.status(201).json({
      success: true,
      message: "resource uploaded succesfully",
      resourceId: newResource._id,
    });
  } catch (error) {
    console.error("Create course error:", error);
    return res
      .status(500)
      .json({ success: false, message: "error::server error" });
  }
};

module.exports = uploadResourceHandler;

