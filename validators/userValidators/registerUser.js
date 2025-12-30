const Joi = require("joi");

const userSchema = Joi.object({
  firstName: Joi.string().trim().required(),

  lastName: Joi.string().trim().required(),

  otherName: Joi.string().trim().optional().allow(null),

  phoneNumber: Joi.string().trim().required(),

  university: Joi.string().trim().required(),

  acadamicLevel: Joi.string().trim().required(),

  program: Joi.string()
    .valid("LL.B", "LL.M", "M.A", "PFD")
    .required(),

  studentId: Joi.string().when("role", {
    is: "student",
    then: Joi.required(),
    otherwise: Joi.optional().allow(null),
  }),

  email: Joi.string().email().lowercase().required(),

  password: Joi.string()
    .min(8)
    .required(),

  confirmPassword: Joi.string()
    .required()
    .valid(Joi.ref("password"))
    .messages({
      "any.only": "Confirm password must match password",
    }),

  role: Joi.string()
    .valid("student", "lecturer", "admin")
    .default("student"),

  detectedCountry: Joi.string().trim().optional().allow(null),
})
  // ❗ remove confirmPassword before saving to DB
  .options({ abortEarly: false });

  module.exports = userSchema
