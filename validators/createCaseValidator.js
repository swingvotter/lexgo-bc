const Joi = require("joi");

const createCaseSchema = Joi.object({
  title: Joi.string().trim().required(),
  citation: Joi.string().trim().required(),
  jurisdiction: Joi.string().required(),
  decision: Joi.string().allow(""),
  judgmentDate: Joi.date().max("now"),
  summary: Joi.string().allow(""),
  ratioDecidendi: Joi.string().allow(""),
  obiterDicta: Joi.string().allow(""),
  proceduralHistory: Joi.string().allow(""),

  court: Joi.object({
    name: Joi.string().required(),
    level: Joi.string().allow(""),
  }).required(),

  parties: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      role: Joi.string().valid("Appellant", "Respondent").required(),
    })
  ).min(1).required(),

  judges: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      position: Joi.string().allow(""),
    })
  ).min(1).required(),

  legalAuthorities: Joi.array().items(
    Joi.object({
      name: Joi.string().allow(""),
      section: Joi.string().allow(""),
    })
  ).optional().default([]),

  precedents: Joi.array().items(
    Joi.object({
      citation: Joi.string().allow(""),
      title: Joi.string().allow(""),
    })
  ).optional().default([]),

  keywords: Joi.array().items(Joi.string().trim()).optional().default([]),
});

module.exports = createCaseSchema;
