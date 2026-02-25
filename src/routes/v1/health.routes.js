const express = require("express");

/*
 express = library that helps create server routes
 Router() = mini-server that holds routes
*/
const router = express.Router();

/*
 Health Check Route
 URL: /health
 Method: GET
*/
router.get("/health", async (req, res) => {
  try {
    // Server uptime = how long server has been running
    const uptime = process.uptime();

    // Memory usage = how much RAM Node.js is using
    const memoryUsage = process.memoryUsage();

    // Current time on server
    const timestamp = new Date().toISOString();

    res.status(200).json({
      status: "OK",
      message: "Server is healthy",
      environment: process.env.NODE_ENV || "development",
      uptime_seconds: uptime,
      timestamp: timestamp,

      memory: {
        rss: memoryUsage.rss,        // total memory used
        heapTotal: memoryUsage.heapTotal, // allocated memory
        heapUsed: memoryUsage.heapUsed,   // actually used memory
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: "Server health check failed",
      error: error.message,
    });
  }
});

module.exports = router;