const path = require('../../../../../path');
const quizQueue = require(path.queues.v1.quiz);

const generateQuizHandler = async (req, res) => {
  try {
    const { topic, difficultyLevel, numberOfQuiz } = req.body || {};
    const userId = req.userInfo.id; // from auth middleware

    // 1️⃣ Validate input
    if (!topic || !difficultyLevel || !numberOfQuiz) {
      return res.status(400).json({
        message: "topic, difficultyLevel, and numberOfQuiz are required",
      });
    }

    // 2️⃣ Add job to queue for background processing
    const job = await quizQueue.add(
      "generate-quiz",
      {
        topic,
        difficultyLevel,
        numberOfQuiz,
        userId,
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
      }
    );

    res.status(202).json({
      message: "Quiz generation started",
      jobId: job.id,
      status: "processing",
    });
  } catch (error) {
    console.error("Quiz queue error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = generateQuizHandler;
