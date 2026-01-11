const { Queue } = require("bullmq");
const redis = require("../config/redis");

// Create a new queue specifically for lecturer quiz generation
const lecturerQuizQueue = new Queue("lecturer-quiz-generation", {
    connection: redis,
});

module.exports = lecturerQuizQueue;
