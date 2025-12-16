const User = require("../../models/user.Model");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const {generateAccessToken, generateRefreshToken} = require("../../utils/token") 

const loginUser = async (req, res) => {
  try {
    
    const {email,password} = req.body;
    
    console.log(req.body);
    console.log(`email::${email} password::${password}`);
    
    if(!email || !password){
        return res.status(400).json({ success: false, message: "invalid fields",doc:"make sure all fields are correctly spelt and included"});
    }
    
    const user = await User.findOne({email})

    if(!user){
      return res.status(401).json({ success: false, message: "wrong credentails",doc:"meaning user has not registred or wrong credentials" });
    }
    
    const passwordExist = await bcrypt.compare(password,user.password)
    
    if(!passwordExist){
      return res.status(401).json({ success: false, message: "wrong credentails",doc:"meaning user has not registred or wrong credentials" });
    }

    const accessToken = generateAccessToken(user._id)
    const refreshToken = generateRefreshToken(user._id)

    res.cookie("refreshToken",refreshToken,{
      httpOnly:true,
      secure:process.env.NODE_ENV === "production",
      sameSite:"strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    user.refreshToken = refreshToken
    await user.save()

     return res.status(200).json({
      success: true,
      message: "user login successfully",
      accessToken
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: `error:${error}` });
  }
};

module.exports = loginUser;
