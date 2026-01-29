const express = require("express")
const router = express.Router()
const path = require("../path")
const authMiddleware = require(path.middleware.auth)
const adminMiddleware = require(path.middleware.admin)
const adminFindUsersHandler = require("../controllers/admin/users/fetchUsers")
const adminFetchCoursesHandler = require("../controllers/admin/courses/fetchCourses")
const adminFetchEnrollmentsHandler = require("../controllers/admin/enrollments/fetchEnrollments")
const adminFetchQuizSubmissionsHandler = require("../controllers/admin/quizzes/fetchSubmissions")
const { apiLimiter } = require(path.utils.rateLimiter)

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