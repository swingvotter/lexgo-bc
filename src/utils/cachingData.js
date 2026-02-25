const path = require("../path");
const redis  = require(path.config.redis);

const setCache = async (key, value, expirationInSeconds) => {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', expirationInSeconds);
    } catch (error) {
      console.error("Error setting cache:", error);
    }
};

const getCache = async (key) => {
  try {
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error("Error getting cache:", error);
    return null;
  }
};

const deleteCache = async (key) => {
  try {
    await redis.del(key);
  } catch (error) {
    console.error("Error deleting cache:", error);
  }
};

module.exports = { setCache, getCache, deleteCache };