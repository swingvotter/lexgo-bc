const { Queue } = require("bullmq");
const redis = require("../config/redis");

const quizQueue = new Queue("quiz-generation", {
  connection: redis,
});

quizQueue.on("error", (error) => {
  console.error("Quiz queue error:", error.message);
});

module.exports = quizQueue;

