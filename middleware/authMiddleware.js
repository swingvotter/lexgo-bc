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
        return res.status(401).json({success:false,message:`error from middleware: ${error}`})      
    }
}

module.exports = authMiddleware