const jwt = require("jsonwebtoken")

const authMiddleware = async(req,res,next)=>{
    
    try{

        const token = req.cookies.accessToken

        if(!token){
            return res.status(401).json({success:false, message:"accessToken is absent"})
        }
        
        const decodeToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        
        req.userInfo = decodeToken

        console.log(decodeToken);
    
        next()

    } catch(error){
    // Token invalid or expired
    if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
    return res.status(500).json({ success: false, message: `Middleware error: ${error.message}` });
  }
}

module.exports = authMiddleware