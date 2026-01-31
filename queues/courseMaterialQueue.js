const { Queue } = require("bullmq");
const path = require("../path");
const redis = require(path.config.redis);

const courseMaterialQueue = new Queue("course-material-generation", {
  connection: redis,
  defaultJobOptions: {
        removeOnComplete: true, // remove completed jobs automatically
        removeOnFail: true,     // remove failed jobs automatically
        attempts: 3,            // retry failed jobs up to 3 times
    },
});

courseMaterialQueue.on("error", (error) => {
  console.error("Course material queue error:", error.message);
});

module.exports = courseMaterialQueue;
