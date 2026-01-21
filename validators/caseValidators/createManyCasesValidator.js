const Joi = require("joi");
const createCaseSchema = require("./createCaseValidator");

const createManyCasesSchema = Joi.array().items(createCaseSchema).min(1).required();

module.exports = createManyCasesSchema;
