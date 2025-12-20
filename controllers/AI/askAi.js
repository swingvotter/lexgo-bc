const User = require("../../models/user.Model")

const askAiHandler = async(req,res)=>{
    try{
        const userId = req.userInfo.id // Fix: use 'id' not 'userId'
       
        // Remove unnecessary user lookup - authMiddleware already validates
        // Just update the counter
        await User.findByIdAndUpdate(
            userId,
            { $inc: { askAI: 1 } },
            { new: true }
        )

        return res.status(200).json({ 
            success: true, 
            message: "Ai asked successfully" 
        });

    }catch(error){
        // Don't expose error details
        return res.status(500).json({ 
            success: false, 
            message: "Failed to process AI request. Please try again later." 
        });
    }
}

module.exports = askAiHandler