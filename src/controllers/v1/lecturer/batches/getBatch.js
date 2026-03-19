const path = require("../../../../path");
const Batch = require(path.models.lecturer.batch);
const BatchData = require(path.models.lecturer.batchData);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);
const AppError = require(path.error.appError);

const getBatch = async (req, res) => {
  const { id } = req.params;
  const lecturerId = req.userInfo?.id;

  const batch = await Batch.findOne({ _id: id, userId: lecturerId });

  if (!batch) {
    throw new AppError("Batch not found", 404);
  }

  const students = await BatchData.find({ batchId: batch._id }).lean();

  logger.info("Batch fetched", { lecturerId, batchId: batch._id, studentCount: students.length });

  return res.status(200).json({
    success: true,
    data: {
      batch,
      students,
    },
  });
};

module.exports = asyncHandler(getBatch);
