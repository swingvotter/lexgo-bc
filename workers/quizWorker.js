const { Worker } = require("bullmq");
const redis = require("../config/redis");
const Quiz = require("../models/users/quiz.Model");
const quizGeneratorGPT = require("../utils/ai/quizGenerator");

let quizWorker = null;

function createWorker() {
  if (quizWorker) return quizWorker;

  quizWorker = new Worker(
    "quiz-generation",
    async (job) => {
      const { topic, difficultyLevel, numberOfQuiz, userId } = job.data;

      const aiResponse = await quizGeneratorGPT(
        topic,
        numberOfQuiz,
        difficultyLevel
      );

      let parsed;
      try {
        parsed = JSON.parse(aiResponse);
      } catch (error) {
        throw new Error("AI returned invalid JSON format");
      }

      if (!Array.isArray(parsed.questions)) {
        throw new Error("AI response missing questions array");
      }

      const questions = parsed.questions.map((q) => ({
        question: q.question,
        options: q.answers,
        correctAnswer: q.correctAnswer,
        userAnswer: null,
      }));

      const quiz = await Quiz.create({
        userId,
        topic,
        difficultyLevel,
        totalQuestions: questions.length,
        questions,
      });

      return { quizId: quiz._id.toString() };
    },
    {
      connection: redis,
      concurrency: 5,
    }
  );

  quizWorker.on("completed", (job) => {
    console.log(`Quiz job ${job.id} completed`);
  });

  quizWorker.on("failed", (job, err) => {
    console.error(`Quiz job ${job.id} failed:`, err.message);
  });

  quizWorker.on("error", (error) => {
    console.error("Quiz worker error:", error.message);
  });

  return quizWorker;
}

module.exports = createWorker;

