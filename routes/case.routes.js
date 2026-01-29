const express = require("express");
const router = express.Router();
const path = require("../path");

const authMiddleware = require(path.middleware.auth);
const adminMiddleware = require(path.middleware.admin);

const createCase = require("../controllers/admin/adminCases/createCase");
const createManyCases = require("../controllers/admin/adminCases/createManyCases");
const deleteCase = require("../controllers/admin/adminCases/deleteCase");
const updateCase = require("../controllers/admin/adminCases/updateCase");
const getAllCases = require("../controllers/admin/adminCases/getCases");
const getCaseById = require("../controllers/admin/adminCases/getCase");

const { apiLimiter } = require(path.utils.rateLimiter);

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
