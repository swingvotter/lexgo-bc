const User = require("../../models/users/user.Model");
const Course = require("../../models/lecturer/courses.Model");
const Resource = require("../../models/lecturer/resource");
const ResourceContent = require("../../models/lecturer/resourceContent");
const {
  uploadPdfBufferToCloudinary,
} = require("../../utils/CloudinaryBufferUploader");
const cloudinary = require("../../config/cloudinary");
const pdfParse = require("pdf-parse");
const removeNewlines = require("../../utils/newLineRemover");

const uploadResourceHandler = async (req, res) => {
  try {

    const {courseId} = req.params
    
    if (!courseId) {
      return res
        .status(400)
        .json({ success: false, message: "courseId is missing" });
    }

    if (!req.file) {
      return res
        .status(404)
        .json({ success: false, message: "file is missing" });
    }

    const lecturerId = req.userInfo.id;

    const user = await User.findById(lecturerId);

    const course = await Course.findOne({ _id:courseId, lecturerId });

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

    const result = await uploadPdfBufferToCloudinary(req.file.buffer);

    if (!result) {
      return res
        .status(400)
        .json({ success: false, message: "course do not exist" });
    }

    const signedUrl = cloudinary.url(result.public_id, {
      resource_type: "raw", // << important
      type: "private",
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    });

    const data = await pdfParse(req.file.buffer)

    
    const newResource = await Resource.create({
      lecturerId,
      courseId: course._id,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileExtension: req.file.mimetype,
      publicId: result.public_id,
      url: signedUrl, // store the signed URL instead
    });
   
    const updatedContent = removeNewlines(data.text)

    await ResourceContent.create({
      resourceId: newResource._id,
      courseId: course._id,
      content: updatedContent,
    })

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
