const app = require("./app")
const connectDb = require("./config/db")
const redis = require("./config/redis")
const createQuizWorker = require("./workers/quizWorker")
const createCourseMaterialWorker = require("./workers/courseMaterialWorker")

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
});

redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});

redis.on("close", () => {
  console.log("Redis connection closed");
});

app.listen(port,()=>{
    console.log(`server connected on port ${port}`);
    connectDb()
})