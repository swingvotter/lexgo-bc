const app = require("./src/app")
const connectDb = require("./src/config/db")
const redis = require("./src/config/redis")
const createQuizWorker = require("./src/workers/v1/quizWorker")
const createCourseMaterialWorker = require("./src/workers/v1/courseMaterialWorker")
const createLecturerWorker = require("./src/workers/v1/lecturerQuizWorker")
const createCaseQuizWorker = require("./src/workers/v1/caseQuizWorker")
const mongoose = require("mongoose");

const port = process.env.PORT || 3001


//REDIS READY EVENT

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

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Graceful shutdown...");
  await mongoose.disconnect();
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});


app.listen(port, () => {
  console.log(`server connected on port ${port}`);
  connectDb()
})