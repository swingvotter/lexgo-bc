const Course = require("../../models/lecturer/courses.Model");
const User = require("../../models/users/user.Model");
const  {uploadImageBufferToCloudinary}  = require("../../utils/CloudinaryBufferUploader");

const createCourseHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "file is missing" });
    }

    const lecturerId = req.userInfo?.id;

    const { title, category, institution, description, level, courseCode } =
      req.body;

    if (!title || !category || !institution || !level || !courseCode) {
      return res
        .status(400)
        .json({
          success: false,
          message: "missing fields all fields are required",
        });
    }

    const user = await User.findById(lecturerId);

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "user do not exist" });
    }

    // CLOUDINARY HERE (IMAGE UPLOAD)
    const result = await uploadImageBufferToCloudinary(req.file.buffer);

    if (!result) {
      return res
        .status(400)
        .json({ success: false, message: "image upload failed" });
    }

    const newCourse = await Course.create({
      lecturerId,
      title,
      courseImageUrl: result.secure_url,
      coursePublicImageId: result.public_id,
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
    console.error("Create course error:", error);
    return res
      .status(500)
      .json({ success: false, message: "error::server error" });
  }
};

module.exports = createCourseHandler;
