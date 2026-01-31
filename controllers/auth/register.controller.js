const path = require("../../path");
const User = require(path.models.users.user);
const bcrypt = require("bcrypt");
const registerUserSchema = require(path.validators.user.register);
const logger = require(path.config.logger);

const registerUser = async (req, res) => {
  try {
    const detectedC = req.detectedCountry;

    // Validate request body using Joi schema
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

    const { email, password, confirmPassword, phoneNumber, ...rest } = value;

    // Check if user already exists with this email or phone number
    const existingUser = await User.findOne({
      $or: [
        { email },
        { phoneNumber }
      ]
    });

    if (existingUser) {
      const field = existingUser.email === email ? "Email" : "Phone number";
      logger.warn("Registration attempt with existing credentials", { field, email, phoneNumber });
      return res.status(400).json({
        success: false,
        message: `${field} is already registered with another account`
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      ...rest,
      email,
      phoneNumber,
      password: hashPassword,
    });

    const safeUser = await User.findById(user._id).select("-password");

    logger.info("User registered successfully", { userId: user._id, email, role: user.role, university: user.university });

    return res.status(201).json({
      success: true,
      message: "account created successfully",
      data: safeUser,
    });
  } catch (error) {
    // Handle Mongoose duplicate key errors (E11000)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      let message = "A duplicate value was found";

      if (field === "studentId") message = "A user with this Student ID already exists";
      if (field === "email") message = "A user with this email address already exists";
      if (field === "phoneNumber") message = "A user with this phone number already exists";

      logger.warn("Duplicate key error during registration", { field, value: error.keyValue[field] });

      return res.status(409).json({
        success: false,
        message,
        error: "DuplicateKeyError"
      });
    }

    logger.error("Registration error", { error: error.message, stack: error.stack, email: req.body?.email });
    return res
      .status(500)
      .json({ success: false, message: "Internal server error during registration" });
  }
};

module.exports = registerUser;
