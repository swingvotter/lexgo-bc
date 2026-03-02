const path = require('../../../../path');
const AdminCase = require(path.models.admin.case);
const updateCaseSchema = require(path.validators.v1.admin.updateCase);
const AppError = require(path.error.appError);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

const updateCase = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    logger.warn("Case update missing id");
    throw new AppError("Case ID is required", 400);
  }

  // Step 1: Validate request body
  const { error, value } = updateCaseSchema.validate(req.body || {}, {
    abortEarly: false,
    allowUnknown: false,
  });

  if (error) {
    logger.warn("Case update validation failed", { message: error.message });
    throw new AppError(error.message, 400);
  }

  // `.min(1)` already enforces this, but extra safety is fine
  if (Object.keys(value).length === 0) {
    logger.warn("Case update empty", { caseId: id });
    throw new AppError("At least one field must be provided to update", 400);
  }

  // Step 2: Check for duplicates
  if (value.title || value.citation) {
    const duplicate = await AdminCase.findOne({
      _id: { $ne: id },
      $or: [
        value.title ? { title: value.title } : null,
        value.citation ? { citation: value.citation } : null,
      ].filter(Boolean),
    });

    if (duplicate) {
      logger.warn("Case duplicate", { title: value.title, citation: value.citation });
      throw new AppError("Another case with this title or citation already exists", 409);
    }
  }

  // Step 3: Update
  const updatedCase = await AdminCase.findByIdAndUpdate(
    id,
    { $set: value },
    { new: true, runValidators: true }
  );

  if (!updatedCase) {
    logger.warn("Case update missing", { caseId: id });
    throw new AppError("Case not found", 404);
  }

  logger.info("Case updated", { caseId: updatedCase?._id });
  return res.status(200).json({
    success: true,
    message: "Case successfully updated",
    data: updatedCase,
  });
};

module.exports = asyncHandler(updateCase);
