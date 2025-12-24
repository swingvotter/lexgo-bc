const joi = require("joi")

const productSchema = joi.object({
    name:joi.string().max(5).min(3),
    price:joi.number(),
    products:joi.array().length(2)
})

module.exports = productSchema