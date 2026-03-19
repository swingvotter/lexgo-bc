const path = require("../../../../path");
const Batch = require(path.models.lecturer.batch);
const BatchData = require(path.models.lecturer.batchData);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);
const AppError = require(path.error.appError);

const deleteBatch = async (req, res) => {
  const { id } = req.params;
  const lecturerId = req.userInfo?.id;

  const batch = await Batch.findOne({ _id: id, userId: lecturerId });

  if (!batch) {
    throw new AppError("Batch not found", 404);
  }

  await BatchData.deleteMany({ batchId: batch._id });
  await Batch.deleteOne({ _id: batch._id });

  logger.info("Batch deleted", { lecturerId, batchId: batch._id });

  return res.status(200).json({
    success: true,
    message: "Batch deleted successfully",
  });
};

module.exports = asyncHandler(deleteBatch);
