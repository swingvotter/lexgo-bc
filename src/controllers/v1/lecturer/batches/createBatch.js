const path = require("../../../../path");
const Batch = require(path.models.lecturer.batch);
const BatchData = require(path.models.lecturer.batchData);
const User = require(path.models.users.user);
const Enrollment = require(path.models.users.enrollment);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);
const AppError = require(path.error.appError);

const createBatch = async (req, res) => {
  const { batchId, batchName, batchYear, courseId } = req.body;
  const lecturerId = req.userInfo?.id;

  if (!batchId || !batchName || !batchYear) {
    throw new AppError("batchId, batchName, and batchYear are required", 400);
  }

  const existingBatch = await Batch.findOne({
    userId: lecturerId,
    batchId: batchId,
  });

  if (existingBatch) {
    throw new AppError("Batch with this ID already exists for this lecturer", 400);
  }

  const batch = await Batch.create({
    userId: lecturerId,
    batchId,
    batchName,
    batchYear,
  });

  const enrollmentFilter = {
    status: "approved",
  };

  if (courseId) {
    enrollmentFilter.course = courseId;
  }

  const enrollments = await Enrollment.find(enrollmentFilter)
    .populate({
      path: "userId",
      select: "firstName lastName email acadamicLevel program createdAt",
      match: { role: "student" },
    })
    .lean();

  const studentsInYear = enrollments.filter((enrollment) => {
    if (!enrollment.userId) return false;
    
    const enrollmentYear = new Date(enrollment.createdAt).getFullYear().toString();
    return enrollmentYear === batchYear;
  });

  const batchDataEntries = [];
  const processedEmails = new Set();

  for (const enrollment of studentsInYear) {
    const student = enrollment.userId;
    
    if (processedEmails.has(student.email)) {
      continue;
    }
    
    processedEmails.add(student.email);

    batchDataEntries.push({
      batchId: batch._id,
      studentName: `${student.firstName} ${student.lastName}`,
      email: student.email,
      gpa: null,
      studentLevel: student.acadamicLevel || null,
      studentProgram: student.program || null,
    });
  }

  let insertedCount = 0;
  if (batchDataEntries.length > 0) {
    const result = await BatchData.insertMany(batchDataEntries, { ordered: false });
    insertedCount = result.length;
  }

  logger.info("Batch created successfully", {
    lecturerId,
    batchId: batch._id,
    batchYear,
    studentsAdded: insertedCount,
  });

  return res.status(201).json({
    success: true,
    message: "Batch created successfully",
    data: {
      batch,
      studentsAdded: insertedCount,
    },
  });
};

module.exports = asyncHandler(createBatch);

