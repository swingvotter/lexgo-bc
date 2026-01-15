const User = require("../../models/users/user.Model");
const bcrypt = require("bcrypt");
const registerUserSchema = require("../../validators/userValidators/registerUser");

const registerUser = async (req, res) => {
  try {
    const detectedC = req.detectedCountry;

    // Validate request body using Joi schema
    const { error, value } = registerUserSchema.validate(
      {
        ...req.body,
        detectedCountry: detectedC ?? req.body.detectedCountry,
      },
      { abortEarly: false, allowUnknown: false }
    );

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((d) => ({
          field: d.path.join("."),
          message: d.message,
        })),
      });
    }

    const { email, password, confirmPassword, ...rest } = value;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "user already exist" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      ...rest,
      email,
      password: hashPassword,
    });

    const safeUser = await User.findById(user._id).select("-password");

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

      return res.status(409).json({
        success: false,
        message,
        error: "DuplicateKeyError"
      });
    }

    console.error("Registration error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error during registration" });
  }
};

module.exports = registerUser;
