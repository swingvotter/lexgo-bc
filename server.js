const app = require("./app")
const connectDb = require("./config/db")
const redis = require("./config/redis")

const port = process.env.PORT || 3001


// Test connection
redis.on("connect", () => {
  console.log("Redis client connected!");
});

redis.on("ready", () => {
  console.log("Redis is ready to use!");
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