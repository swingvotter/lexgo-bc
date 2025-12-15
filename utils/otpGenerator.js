const crypto = require("crypto")

const otpGenerator = ()=>{
    return crypto.randomInt(100000,1000000)
}

module.exports = otpGenerator

