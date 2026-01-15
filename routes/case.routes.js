const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const createCase = require("../controllers/admin/cases/createCase");
const deleteCase = require("../controllers/admin/cases/deleteCase");
const updateCase = require("../controllers/admin/cases/updateCase");
const getAllCases = require("../controllers/admin/cases/getCases");
const getCaseById = require("../controllers/admin/cases/getCase");

const { apiLimiter } = require("../utils/rateLimiter");

// Get all cases
router.get("/", authMiddleware, apiLimiter, getAllCases);

// Get single case
router.get("/:id", authMiddleware, apiLimiter, getCaseById);

// Create case
router.post("/", authMiddleware, apiLimiter, adminMiddleware, createCase);

// Delete case
router.delete("/:id", authMiddleware, apiLimiter, adminMiddleware, deleteCase);

// Update case
router.patch("/:id", authMiddleware, apiLimiter, updateCase);

module.exports = router;
