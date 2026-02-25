const path = require("../../path");
const registerUserSchema = require(path.validators.v1.user.register);
const { registerUser: registerUserService } = require(path.services.v1.auth.register);
const logger = require(path.config.logger);
const asyncHandler = require(path.utils.asyncHandler);


const registerUserHandler = async (req, res) => {
  const detectedC = req.detectedCountry;

  const { error, value } = registerUserSchema.validate(
    {
      ...(req.body || {}),
      detectedCountry: detectedC ?? req.body?.detectedCountry,
    },
    { abortEarly: false, allowUnknown: false }
  );

  if (error) {
    logger.warn("Registration validation failed", {
      errors: error.details.map((d) => ({ field: d.path.join("."), message: d.message })),
      email: req.body?.email
    });
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.details.map((d) => ({
        field: d.path.join("."),
        message: d.message,
      })),
    });
  }

  const safeUser = await registerUserService(value);

  logger.info("User registered successfully", { userId: safeUser?._id, email: safeUser?.email });

  return res.status(201).json({
    success: true,
    message: "account created successfully",
    data: safeUser,
  });
};

module.exports = asyncHandler(registerUserHandler);
