const crypto = require("crypto")

const otpGenerator = ()=>{
    return crypto.randomInt(1000,10000)
}

module.exports = otpGenerator

