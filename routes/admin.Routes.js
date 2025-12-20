// routes/adminRoutes.js
const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/authMiddleware")
const adminMiddleware = require("../middleware/adminMiddleware") // Create this!
const adminFindUsersHandler = require("../controllers/admin/fetchUsers")
const { apiLimiter } = require("../utils/rateLimiter")

// Apply rate limiting, auth, and admin checks
router.get("/users", 
  apiLimiter,           // Rate limiting
  authMiddleware,       // Authentication
  adminMiddleware,      // Authorization (admin only)
  adminFindUsersHandler
)

module.exports = router