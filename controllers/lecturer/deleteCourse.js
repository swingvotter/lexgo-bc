const Course = require("../../models/lecturer/courses.Model");
const Resource = require("../../models/lecturer/resource");
const ResourceContent = require("../../models/lecturer/resourceContent");
const CourseMaterial = require("../../models/lecturer/courseMaterial");
const cloudinary = require("../../config/cloudinary");

const deleteCourseHandler = async (req, res) => {
  try {
    const courseId = req.params?.courseId;
    if (!courseId) {
      return res.status(400).json({ success: false, message: "courseId is required" });
    }

    const lecturerId = req.userInfo?.id;
    if (!lecturerId) {
      return res.status(401).json({ success: false, message: "unauthorized" });
    }

    const course = await Course.findOne({ _id: courseId, lecturerId });
    if (!course) {
      return res.status(404).json({ success: false, message: "course not found or not owned by you" });
    }

    // 1. Delete course image from Cloudinary (if present)
    if (course.coursePublicImageId) {
      try {
        await cloudinary.uploader.destroy(course.coursePublicImageId);
      } catch (err) {
        console.error("Failed to delete course image from cloudinary:", err.message);
      }
    }

    // 2. Find resources for the course and delete their files from Cloudinary
    const resources = await Resource.find({ courseId });
    await Promise.all(
      resources.map(async (r) => {
        if (r.publicId) {
          try {
            await cloudinary.uploader.destroy(r.publicId, { resource_type: "raw", type: "private" });
          } catch (err) {
            console.error("Failed to delete resource from cloudinary:", err.message);
          }
        }
      })
    );

    // 3. Remove DB entries related to the course
    await Resource.deleteMany({ courseId });
    await ResourceContent.deleteMany({ courseId });
    await CourseMaterial.deleteMany({ courseId });

    // 4. Finally remove the course
    await Course.findByIdAndDelete(courseId);

    return res.status(200).json({ success: true, message: "course and related resources deleted" });
  } catch (error) {
    console.error("Delete course error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = deleteCourseHandler;
