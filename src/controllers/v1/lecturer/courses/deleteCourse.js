const mongoose = require("mongoose");
const path = require('../../../../path');
const Course = require(path.models.lecturer.course);
const Resource = require(path.models.lecturer.resource);
const ResourceContent = require(path.models.lecturer.resourceContent);
const CourseMaterial = require(path.models.lecturer.courseMaterial);
const LecturerCase = require(path.models.lecturer.case);
const Enrollment = require(path.models.users.enrollment);
const LecturerQuiz = require(path.models.lecturer.quiz);
const LecturerQuizSubmission = require(path.models.users.lecturerQuizSubmission);
const CaseQuiz = require(path.models.lecturer.caseQuiz);
const CaseQuizSubmission = require(path.models.users.caseQuizSubmission);
const SubLecturer = require(path.models.lecturer.subLecturer);
const cloudinary = require(path.config.cloudinary);


/**
 * Delete a course and all its related resources
 * 
 * @route DELETE /api/Courses/:courseId
 * @access Private - Requires authentication (lecturer only)
 * 
 * @description Performs a cascading delete that removes:
 * 1. Course image from Cloudinary
 * 2. All resource files (PDFs) from Cloudinary
 * 3. All database records (Resources, ResourceContents, CourseMaterials, Cases, Enrollments, Quizzes, QuizSubmissions)
 * 4. The course itself
 * 
 * @param {string} req.params.courseId - The course ID to delete
 */
const deleteCourseHandler = async (req, res) => {
  const session = await mongoose.startSession();
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
        console.error("Failed to delete course image from cloudinary:", err.message);
      }
    }

    // Step 2: Find and Delete resource files from Cloudinary
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

    // Step 3: Find and Delete case files from Cloudinary
    const cases = await LecturerCase.find({ courseId });
    await Promise.all(
      cases.map(async (c) => {
        if (c.caseDocumentPublicId) {
          try {
            await cloudinary.uploader.destroy(c.caseDocumentPublicId, { resource_type: "raw", type: "private" });
          } catch (err) {
            console.error("Failed to delete case document from cloudinary:", err.message);
          }
        }
      })
    );

    // --- Start Database Transaction ---
    session.startTransaction();

    // Step 4: Remove all related database entries
    await Resource.deleteMany({ courseId }).session(session);
    await ResourceContent.deleteMany({ courseId }).session(session);
    await CourseMaterial.deleteMany({ courseId }).session(session);
    await LecturerCase.deleteMany({ courseId }).session(session);
    await CaseQuiz.deleteMany({ caseId: { $in: cases.map(c => c._id) } }).session(session);
    await CaseQuizSubmission.deleteMany({ courseId }).session(session);
    await Enrollment.deleteMany({ course: courseId }).session(session);
    await LecturerQuiz.deleteMany({ courseId }).session(session);
    await LecturerQuizSubmission.deleteMany({ courseId }).session(session);
    await SubLecturer.deleteMany({ courseId }).session(session);

    // Step 5: Finally remove the course itself
    await Course.findByIdAndDelete(courseId).session(session);

    await session.commitTransaction();

    return res.status(200).json({ success: true, message: "course and all related resources deleted successfully" });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error("Delete course error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  } finally {
    session.endSession();
  }
};

module.exports = deleteCourseHandler;


