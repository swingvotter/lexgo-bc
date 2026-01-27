const { Queue } = require("bullmq");
const redis = require("../config/redis");

const caseQuizQueue = new Queue("case-quiz-generation", {
    connection: redis,
});

module.exports = caseQuizQueue;
