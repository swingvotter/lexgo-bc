const Redis = require("ioredis");

// Initialize Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST,      // e.g., "your-redis-host.redis.com"
  port: process.env.REDIS_PORT,      // e.g., 6379
  username: process.env.REDIS_USERNAME, // optional, for Redis 6+ ACL
  password: process.env.REDIS_PASSWORD,
  tls: process.env.REDIS_TLS ? {} : undefined // optional: if your Redis requires TLS/SSL
});

module.exports = redis;
