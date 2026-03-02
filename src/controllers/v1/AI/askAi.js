const User = require("../../models/user.Model")
const AppError = require("../../../error/appError")
const asyncHandler = require("../../../utils/asyncHandler")
const logger = require("../../../config/logger")

const askAiHandler = async(req,res)=>{
    const userId = req.userInfo.id // Fix: use 'id' not 'userId'
   
    // Remove unnecessary user lookup - authMiddleware already validates
    // Just update the counter
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $inc: { askAI: 1 } },
        { new: true }
    )

    if (!updatedUser) {
        logger.warn("AI user missing", { userId })
        throw new AppError("User not found", 404)
    }

    logger.info("AI asked", { userId })
    return res.status(200).json({ 
        success: true, 
        message: "Ai asked successfully" 
    });
}

module.exports = asyncHandler(askAiHandler)
