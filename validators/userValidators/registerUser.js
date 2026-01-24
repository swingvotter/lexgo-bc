const Joi = require("joi");

const userSchema = Joi.object({
  firstName: Joi.string().trim().min(3).max(15).required(),

  lastName: Joi.string().trim().min(3).max(15).required(),

  otherName: Joi.string().trim().min(3).max(15).optional().allow(null),

  phoneNumber: Joi.string()
    .trim()
    .pattern(/^\+?[0-9]{10,15}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid phone number format",
    }),

  university: Joi.string().trim().required(),

  acadamicLevel: Joi.when("role", {
    is: "student",
    then: Joi.string().trim().required(),
    otherwise: Joi.forbidden(),
  }),

  program: Joi.when("role", {
    is: "student",
    then: Joi.string()
      .valid("LL.B", "LL.M", "M.A", "PFD")
      .required(),
    otherwise: Joi.forbidden(),
  }),

  studentId: Joi.when("role", {
    is: "student",
    then: Joi.string().min(5).max(20).required(),
    otherwise: Joi.forbidden(),
  }),

  email: Joi.string().email().lowercase().required(),

  password: Joi.string().min(8).required(),

  confirmPassword: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .messages({
      "any.only": "Confirm password must match password",
    }),
  role: Joi.string()
    .valid("student", "lecturer", "admin")
    .default("student"),

  detectedCountry: Joi.string().trim().optional().allow(null),
}).options({ abortEarly: false });

module.exports = userSchema;
