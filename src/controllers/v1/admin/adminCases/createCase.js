const path = require('../../../../path');
const AdminCase = require(path.models.admin.case);
const createCaseSchema = require(path.validators.v1.admin.createCase);
const AppError = require(path.error.appError);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

const createCase = async (req, res) => {
  const { error, value } = createCaseSchema.validate(req.body || {}, {
    abortEarly: false,
    allowUnknown: false,
  });

  if (error) {
    logger.warn("Case validation failed", { message: error.message });
    throw new AppError(error.message, 400);
  }

  // Step 2: Check for duplicates in DB
  const existingCase = await AdminCase.findOne({
    $or: [
      { title: value.title },
      { citation: value.citation },
    ],
  });

  if (existingCase) {
    logger.warn("Case duplicate", { title: value.title, citation: value.citation });
    throw new AppError("Case with this title or citation already exists", 409);
  }

  // Step 3: Create new case
  const newCase = await AdminCase.create(value);

  logger.info("Case created", { caseId: newCase?._id });
  return res.status(201).json({ success: true, message: "case succesfully created", data: newCase });
};

module.exports = asyncHandler(createCase);
