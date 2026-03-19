const path = require("../../../../../path");
const Batch = require(path.models.lecturer.batch);
const BatchData = require(path.models.lecturer.batchData);
const User = require(path.models.users.user);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);
const AppError = require(path.error.appError);

const getBatch = async (req, res) => {
  const { id } = req.params;
  const deanUniversity = req.userInfo?.university;

  const batch = await Batch.findById(id).lean();

  if (!batch) {
    throw new AppError("Batch not found", 404);
  }

  const lecturer = await User.findById(batch.userId).select("university").lean();

  if (!lecturer || lecturer.university !== deanUniversity) {
    throw new AppError("Access denied. Batch does not belong to your university.", 403);
  }

  const students = await BatchData.find({ batchId: batch._id }).lean();

  logger.info("Dean fetched batch", {
    deanId: req.userInfo?.id,
    batchId: batch._id,
    studentCount: students.length,
  });

  return res.status(200).json({
    success: true,
    data: {
      batch,
      students,
    },
  });
};

module.exports = asyncHandler(getBatch);
