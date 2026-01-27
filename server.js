const app = require("./app")
const connectDb = require("./config/db")
const redis = require("./config/redis")
const createQuizWorker = require("./workers/quizWorker")
const createCourseMaterialWorker = require("./workers/courseMaterialWorker")
const createLecturerWorker = require("./workers/lecturerQuizWorker")
const createCaseQuizWorker = require("./workers/caseQuizWorker")

const port = process.env.PORT || 3001


// Test connection
redis.on("connect", () => {
  console.log("Redis client connected!");
});

redis.on("ready", () => {
  console.log("Redis is ready to use!");
  // Initialize quiz worker when Redis is ready
  createQuizWorker();
  console.log("Quiz worker initialized");
  // Initialize course material worker
  createCourseMaterialWorker();
  console.log("Course material worker initialized");
  // Initialize lecturer quiz worker
  createLecturerWorker();
  console.log("Lecturer quiz worker initialized");
  // Initialize case quiz worker
  createCaseQuizWorker();
  console.log("Case quiz worker initialized");
});

redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});

redis.on("close", () => {
  console.log("Redis connection closed");
});

app.listen(port, () => {
  console.log(`server connected on port ${port}`);
  connectDb()
})