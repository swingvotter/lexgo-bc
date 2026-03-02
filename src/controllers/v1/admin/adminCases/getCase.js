const mongoose = require("mongoose");
const path = require('../../../../path');
const AdminCase = require(path.models.admin.case);
const AppError = require(path.error.appError);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

const getCaseById = async (req, res) => {
  const { id } = req.params;

  // Step 1: Validate MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    logger.warn("Case invalid id", { caseId: id });
    throw new AppError("Invalid case ID", 400);
  }

  // Find the case by ID
  const foundCase = await AdminCase.findById(id).lean();

  if (!foundCase) {
    logger.warn("Case missing", { caseId: id });
    throw new AppError("Case not found", 404);
  }

  logger.info("Case fetched", { caseId: id });
  return res.status(200).json({
    success: true,
    data: foundCase,
  });
};

module.exports = asyncHandler(getCaseById);
