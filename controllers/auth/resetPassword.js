const User = require("../../models/user.Model")

const resetPassword = async(req,res)=>{
    
    try{

     }catch(error){
     return res.status(500).json({
            success: false,
            message: "Server error",
        })   
    }
}
module.exports = resetPassword
