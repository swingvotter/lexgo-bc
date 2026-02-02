const mongoose = require("mongoose");
const Joi = require("joi");
const path = require("../../../path");
const AiHistory = require(path.models.users.aiHistory);
const User = require(path.models.users.user);
const chatGptStream = require(path.utils.ai.chatGptStream);
const newLineRemover = require(path.utils.newLineRemover);

const askAiSchema = Joi.object({
  question: Joi.string().max(2000).required(),
});

async function askAiHandler(req, res) {
  const session = await mongoose.startSession();

  try {
    const { error, value } = askAiSchema.validate(req.body || {});
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    const { question } = value;
    const userId = req.userInfo.id;
    const AI_LIMIT = 20;

    const user = await User.findById(userId).select("askAiCount");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.askAiCount >= AI_LIMIT) {
      return res.status(403).json({
        success: false,
        message: `You have reached your AI question limit of ${AI_LIMIT}.`,
      });
    }

    // 🔹 Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Start OpenAI stream
    const stream = await chatGptStream(question);

    let fullAnswer = "";

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;

      if (delta) {
        fullAnswer += delta;

        // Send chunk immediately to client
        res.write(`data: ${delta}\n\n`);
      }
    }

    // Clean answer before saving
    const cleanedAnswer = newLineRemover(fullAnswer);

    // --- Transaction ---
    session.startTransaction();

    const [aiEntry] = await AiHistory.create(
      [{ userId, question, answer: cleanedAnswer }],
      { session }
    );

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { askAiCount: 1 } },
      { new: true, select: "askAiCount", session }
    );

    await session.commitTransaction();

    // Notify client stream is done
    res.write(`data: [DONE]\n\n`);
    res.end();

  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error(err);

    // If streaming already started, we must end it properly
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Internal server error" });
    } else {
      res.write(`data: [ERROR]\n\n`);
      res.end();
    }
  } finally {
    session.endSession();
  }
}

module.exports = askAiHandler;
