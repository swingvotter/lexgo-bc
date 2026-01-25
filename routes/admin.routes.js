// routes/adminRoutes.js
const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/authMiddleware")
const adminMiddleware = require("../middleware/adminMiddleware") // Create this!
const adminFindUsersHandler = require("../controllers/admin/users/fetchUsers")
const adminFetchCoursesHandler = require("../controllers/admin/courses/fetchCourses")
const adminFetchEnrollmentsHandler = require("../controllers/admin/enrollments/fetchEnrollments")
const adminFetchQuizSubmissionsHandler = require("../controllers/admin/quizzes/fetchSubmissions")
const { apiLimiter } = require("../utils/rateLimiter")

// Apply rate limiting, auth, and admin checks
router.get("/users",
  apiLimiter,           // Rate limiting
  authMiddleware,       // Authentication
  adminMiddleware,      // Authorization (admin only)
  adminFindUsersHandler
)

router.get("/courses",
  apiLimiter,
  authMiddleware,
  adminMiddleware,
  adminFetchCoursesHandler
)

router.get("/enrollments",
  apiLimiter,
  authMiddleware,
  adminMiddleware,
  adminFetchEnrollmentsHandler
)

router.get("/quiz-submissions",
  apiLimiter,
  authMiddleware,
  adminMiddleware,
  adminFetchQuizSubmissionsHandler
)

module.exports = router