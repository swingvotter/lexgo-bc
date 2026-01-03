const { Queue } = require("bullmq");
const redis = require("../config/redis");

const courseMaterialQueue = new Queue("course-material-generation", {
  connection: redis,
});

courseMaterialQueue.on("error", (error) => {
  console.error("Course material queue error:", error.message);
});

module.exports = courseMaterialQueue;
