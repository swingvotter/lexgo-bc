const { Queue } = require("bullmq");
const path = require("../path");
const redis = require(path.config.redis);


// Queue for lecturer quiz generation
const lecturerQuizQueue = new Queue("lecturer-quiz-generation", {
    connection: redis,
    defaultJobOptions: {
        removeOnComplete: true, // remove completed jobs automatically
        removeOnFail: true,     // remove failed jobs automatically
        attempts: 3,            // retry failed jobs up to 3 times
    },
});

lecturerQuizQueue.on("error", (error) => {
  console.error("Lecturer quiz queue error:", error.message);
});

module.exports = lecturerQuizQueue;
