const express = require("express");
const router = express.Router();
const path = require("../../path");

const authMiddleware = require(path.middleware.auth);
const adminMiddleware = require(path.middleware.admin);

const createCase = require("../../controllers/v1/admin/adminCases/createCase");
const createManyCases = require("../../controllers/v1/admin/adminCases/createManyCases");
const deleteCase = require("../../controllers/v1/admin/adminCases/deleteCase");
const updateCase = require("../../controllers/v1/admin/adminCases/updateCase");
const getAllCases = require("../../controllers/v1/admin/adminCases/getCases");
const getCaseById = require("../../controllers/v1/admin/adminCases/getCase");

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
