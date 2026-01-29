const mongoose = require("mongoose");
const Joi = require("joi");
const path = require("../../../path");
const AiHistory = require(path.models.users.aiHistory);
const User = require(path.models.users.user);
const chatGpt = require(path.utils.ai.chatGpt);

// Validation schema for the request body
const askAiSchema = Joi.object({
  question: Joi.string().max(2000).required(),
});

/**
 * Ask AI a question
 * 
 * @route POST /api/user/ai/ask
 * @access Private - Requires authentication
 * 
 * @description Sends a user's question to the OpenAI API via `chatGpt` utility,
 * stores the question and answer in `AiHistory`, and increments the user's
 * `askAiCount`.
 * 
 * @param {string} req.body.question - The question to ask the AI (max 2000 chars)
 * @returns {Object} The AI's answer and updated Q&A history entry
 */
async function askAiHandler(req, res) {
  const session = await mongoose.startSession();
  try {
    // Validate request body
    const { error, value } = askAiSchema.validate(req.body || {}, { abortEarly: false, allowUnknown: false });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    const { question } = value;

    const userId = req.userInfo.id;
    const AI_LIMIT = 20; // You can move this to an env variable later

    // Fetch user and check count BEFORE the expensive AI call
    const user = await User.findById(userId).select("askAiCount");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.askAiCount >= AI_LIMIT) {
      return res.status(403).json({
        success: false,
        message: `You have reached your AI question limit of ${AI_LIMIT}.`,
      });
    }

    // Ask AI (OpenAI integration) - only called if under limit
    const answer = await chatGpt(question);

    if (!answer) {
      return res.status(400).json({
        success: false,
        message: "there was a problem getting answers from openAi",
      });
    }

    // --- Start Database Transaction for consistent updates ---
    session.startTransaction();

    // Save history to database
    const [aiEntry] = await AiHistory.create([{
      userId,
      question,
      answer
    }], { session });

    // Increment user ask count for usage tracking/limits
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { askAiCount: 1 } },
      { new: true, select: "askAiCount", session }
    );

    await session.commitTransaction();

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
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error("Error in askAi controller:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  } finally {
    session.endSession();
  }
}

module.exports = askAiHandler
