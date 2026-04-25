const Redis = require("ioredis");

// Initialize Redis client
// Note: maxRetriesPerRequest must be null for BullMQ to work properly
const redis = new Redis({
  host: process.env.REDIS_HOST, // e.g., "your-redis-host.redis.com"
  port: process.env.REDIS_PORT, // e.g., 6379
  password: process.env.REDIS_PASSWORD || undefined, // Password-only auth (not ACL username+password)
  username: null, // Explicitly disable username to prevent ioredis from auto-detecting REDIS_USERNAME env var
  // Required for BullMQ blocking commands
});

module.exports = redis;
