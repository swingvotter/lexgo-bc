const { Queue } = require("bullmq");
const path = require("../path");
const redis = require(path.config.redis);

const quizQueue = new Queue("quiz-generation", {
    connection: redis,
    defaultJobOptions: {
        removeOnComplete: true, // remove completed jobs automatically
        removeOnFail: true,     // remove failed jobs automatically
        attempts: 3,            // retry failed jobs up to 3 times
    },
})

quizQueue.on("error", (error) => {
  console.error("Quiz queue error:", error.message);
});

module.exports = quizQueue;

