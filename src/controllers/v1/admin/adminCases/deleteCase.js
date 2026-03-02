const path = require('../../../../path');
const AdminCase = require(path.models.admin.case);
const AppError = require(path.error.appError);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

// Delete a case by ID
const deleteCase = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    logger.warn("Case delete missing id");
    throw new AppError("Case ID is required", 400);
  }

  // Find and delete the case
  const deletedCase = await AdminCase.findByIdAndDelete(id);

  if (!deletedCase) {
    logger.warn("Case delete missing", { caseId: id });
    throw new AppError("Case not found", 404);
  }

  logger.info("Case deleted", { caseId: deletedCase?._id });
  return res.status(200).json({
    success: true,
    message: "Case successfully deleted",
    data: deletedCase,
  });
};

module.exports = asyncHandler(deleteCase);
