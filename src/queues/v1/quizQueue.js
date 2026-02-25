const { Queue } = require("bullmq");
const path = require('../../path');
const redis = require(path.config.redis);

const quizQueue = new Queue("quiz-generation", {
    connection: redis,
    defaultJobOptions: {
        removeOnComplete: {
            age: 600, // keep completed jobs for 10 minutes (600 seconds)
            count: 100, // keep last 100 completed jobs
        },
        removeOnFail: {
            age: 600, // keep failed jobs for 10 minutes (600 seconds)
            count: 100, // keep last 100 failed jobs
        },
        attempts: 3, // retry failed jobs up to 3 times
    },
});

quizQueue.on("error", (error) => {
  console.error("Quiz queue error:", error.message);
});

module.exports = quizQueue;

