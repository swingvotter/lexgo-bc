const Course = require("../../models/lecturer/courses.Model");
const Resource = require("../../models/lecturer/resource");
const ResourceContent = require("../../models/lecturer/resourceContent");
const CourseMaterial = require("../../models/lecturer/courseMaterial");
const cloudinary = require("../../config/cloudinary");

/**
 * Delete a course and all its related resources
 * 
 * @route DELETE /api/Courses/:courseId
 * @access Private - Requires authentication (lecturer only)
 * 
 * @description Performs a cascading delete that removes:
 * 1. Course image from Cloudinary
 * 2. All resource files (PDFs) from Cloudinary
 * 3. All database records (Resources, ResourceContents, CourseMaterials)
 * 4. The course itself
 * 
 * @param {string} req.params.courseId - The course ID to delete
 */
const deleteCourseHandler = async (req, res) => {
  try {
    const courseId = req.params?.courseId;
    if (!courseId) {
      return res.status(400).json({ success: false, message: "courseId is required" });
    }

    // Get lecturer ID from auth middleware
    const lecturerId = req.userInfo?.id;
    if (!lecturerId) {
      return res.status(401).json({ success: false, message: "unauthorized" });
    }

    // Verify course exists AND belongs to this lecturer (authorization check)
    const course = await Course.findOne({ _id: courseId, lecturerId });
    if (!course) {
      return res.status(404).json({ success: false, message: "course not found or not owned by you" });
    }

    // Step 1: Delete course image from Cloudinary (if present)
    if (course.coursePublicImageId) {
      try {
        await cloudinary.uploader.destroy(course.coursePublicImageId);
      } catch (err) {
        // Log but don't fail - continue with deletion even if Cloudinary fails
        console.error("Failed to delete course image from cloudinary:", err.message);
      }
    }

    // Step 2: Find all resources and delete their files from Cloudinary
    const resources = await Resource.find({ courseId });
    await Promise.all(
      resources.map(async (r) => {
        if (r.publicId) {
          try {
            // PDFs are stored as private raw files
            await cloudinary.uploader.destroy(r.publicId, { resource_type: "raw", type: "private" });
          } catch (err) {
            console.error("Failed to delete resource from cloudinary:", err.message);
          }
        }
      })
    );

    // Step 3: Remove all related database entries
    await Resource.deleteMany({ courseId });
    await ResourceContent.deleteMany({ courseId });
    await CourseMaterial.deleteMany({ courseId });

    // Step 4: Finally remove the course itself
    await Course.findByIdAndDelete(courseId);

    return res.status(200).json({ success: true, message: "course and related resources deleted" });
  } catch (error) {
    console.error("Delete course error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = deleteCourseHandler;

