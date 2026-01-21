const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const createCase = require("../controllers/admin/cases/createCase");
const createManyCases = require("../controllers/admin/cases/createManyCases");
const deleteCase = require("../controllers/admin/cases/deleteCase");
const updateCase = require("../controllers/admin/cases/updateCase");
const getAllCases = require("../controllers/admin/cases/getCases");
const getCaseById = require("../controllers/admin/cases/getCase");

const { apiLimiter } = require("../utils/rateLimiter");

// Create many cases (bulk)
router.post("/bulk", authMiddleware, adminMiddleware, apiLimiter, createManyCases);


// Get all cases
router.get("/", authMiddleware, apiLimiter, getAllCases);

// Get single case
router.get("/:id", authMiddleware, apiLimiter, getCaseById);

// Create case
router.post("/", authMiddleware, apiLimiter, adminMiddleware, createCase);

// Delete case
router.delete("/:id", authMiddleware, apiLimiter, adminMiddleware, deleteCase);

// Update case
router.patch("/:id", authMiddleware, adminMiddleware, apiLimiter, updateCase);


module.exports = router;
