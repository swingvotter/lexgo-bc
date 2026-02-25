// validators/updateCaseValidator.js
const Joi = require("joi");

const updateCaseSchema = Joi.object({
  title: Joi.string().trim(),
  citation: Joi.string().trim(),
  jurisdiction: Joi.string(),
  decision: Joi.string().allow(""),
  judgmentDate: Joi.date().max("now"),
  summary: Joi.string().allow(""),
  ratioDecidendi: Joi.string().allow(""),
  obiterDicta: Joi.string().allow(""),
  proceduralHistory: Joi.string().allow(""),

  court: Joi.object({
    name: Joi.string().required(),
    level: Joi.string().required(),
  }),

  parties: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      role: Joi.string().valid("Appellant", "Respondent").required(),
    })
  ),

  judges: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      position: Joi.string().required(),
    })
  ),

  legalAuthorities: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      section: Joi.string().required(),
    })
  ),

  precedents: Joi.array().items(
    Joi.object({
      citation: Joi.string().required(),
      title: Joi.string().required(),
    })
  ),

  keywords: Joi.array().items(Joi.string().trim()),
}).min(1); // must update at least one field

module.exports = updateCaseSchema;
