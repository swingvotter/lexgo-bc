const mongoose = require("mongoose");
const Joi = require("joi");
const path = require('../../../../path');
const AiHistory = require(path.models.users.aiHistory);
const User = require(path.models.users.user);
const chatGptStream = require(path.utils.ai.chatGptStream);
const newLineRemover = require(path.utils.newLineRemover);
const AppError = require(path.error.appError);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

const askAiSchema = Joi.object({
  question: Joi.string().max(2000).required(),
});

async function askAiHandler(req, res) {
  const session = await mongoose.startSession();

  const { error, value } = askAiSchema.validate(req.body || {});
  if (error) {
    logger.warn("Ask AI validation", { message: error.message });
    throw new AppError(error.message, 400);
  }

  const { question } = value;
  const userId = req.userInfo.id;

  const user = await User.findById(userId).select("askAiCount");
  if (!user) {
    logger.warn("Ask AI user missing", { userId });
    throw new AppError("User not found", 404);
  }

  // 🔹 Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  
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

  await session.withTransaction(async () => {
    await AiHistory.create(
      [{ userId, question, answer: cleanedAnswer }],
      { session }
    );

    await User.findByIdAndUpdate(
      userId,
      { $inc: { askAiCount: 1 } },
      { new: true, select: "askAiCount", session }
    );
  }).finally(() => session.endSession());

  // Notify client stream is done
  logger.info("Ask AI done", { userId });
  res.write(`data: [DONE]\n\n`);
  res.end();
}

module.exports = asyncHandler(askAiHandler);
