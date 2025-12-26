const Joi = require("joi");
const AiHistory = require("../../../models/users/aiHitory.model");
const User = require("../../../models/users/user.Model");
const chatGpt = require("../../../utils/ai/chatGpt");

const askAiSchema = Joi.object({
  question: Joi.string().max(2000).required(),
});

async function askAiHandler(req, res) {
  try {
    const { error, value } = askAiSchema.validate(req.body,{abortEarly:false,allowUnknown:false});
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    const { question } = value;
    
    const  userId  = req.userInfo.id;

    // Ensure user exists
    const userExists = await User.exists({_id:userId} );
    
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    
    // Ask AI
    const answer = await chatGpt(question);
    
    if (!answer) {
      return res.status(400).json({
        success: false,
        message: "there was a problem getting answers from openAi",
      });
    }
    // Save history
    const aiEntry = await AiHistory.create({
       userId,
      question,
      answer
    });

    // Increment user ask count
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { askAiCount: 1 } },
      { new: true, select: "askAiCount" }
    );

    return res.status(201).json({
      success: true,
      message: "AI answered successfully",
      data: {
        question: aiEntry.question,
        answer: aiEntry.answer,
        createdAt: aiEntry.createdAt,
        askAiCount: updatedUser.askAiCount,
      },
    });

  } catch (err) {
    console.error("Error in askAi controller:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = askAiHandler
