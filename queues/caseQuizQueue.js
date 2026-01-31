const { Queue } = require("bullmq");
const path = require("../path");
const redis = require(path.config.redis);

const caseQuizQueue = new Queue("case-quiz-generation", {
    connection: redis,
    defaultJobOptions: {
        removeOnComplete: true, // remove completed jobs immediately
        removeOnFail: true,     // remove failed jobs immediately
        attempts: 3,            // optional: retry failed jobs up to 3 times
    },
});

module.exports = caseQuizQueue;
