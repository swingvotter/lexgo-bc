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
const AppError = require(path.error.appError);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);


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
  const courseId = req.params?.courseId;
  if (!courseId) {
    logger.warn("Course delete missing id");
    throw new AppError("courseId is required", 400);
  }

  // Get lecturer ID from auth middleware
  const lecturerId = req.userInfo?.id;
  if (!lecturerId) {
    logger.warn("Course delete unauthorized", { courseId });
    throw new AppError("unauthorized", 401);
  }

  // Verify course exists AND belongs to this lecturer (authorization check)
  const course = await Course.findOne({ _id: courseId, lecturerId });
  if (!course) {
    logger.warn("Course delete missing", { courseId, lecturerId });
    throw new AppError("course not found or not owned by you", 404);
  }

  // Step 1: Delete course image from Cloudinary (if present)
  if (course.coursePublicImageId) {
    await cloudinary.uploader
      .destroy(course.coursePublicImageId)
      .catch((err) => logger.warn("Course image delete failed", { courseId, error: err.message }));
  }

  // Step 2: Find and Delete resource files from Cloudinary
  const resources = await Resource.find({ courseId });
  await Promise.all(
    resources.map(async (r) => {
      if (r.publicId) {
        await cloudinary.uploader
          .destroy(r.publicId, { resource_type: "raw", type: "private" })
          .catch((err) => logger.warn("Resource delete failed", { resourceId: r._id, error: err.message }));
      }
    })
  );

  // Step 3: Find and Delete case files from Cloudinary
  const cases = await LecturerCase.find({ courseId });
  await Promise.all(
    cases.map(async (c) => {
      if (c.caseDocumentPublicId) {
        await cloudinary.uploader
          .destroy(c.caseDocumentPublicId, { resource_type: "raw", type: "private" })
          .catch((err) => logger.warn("Case document delete failed", { caseId: c._id, error: err.message }));
      }
    })
  );

  await session.withTransaction(async () => {
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
  }).finally(() => session.endSession());

  logger.info("Course deleted", { courseId, lecturerId });
  return res.status(200).json({ success: true, message: "course and all related resources deleted successfully" });
};

module.exports = asyncHandler(deleteCourseHandler);


