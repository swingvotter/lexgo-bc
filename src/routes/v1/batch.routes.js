const express = require("express");
const router = express.Router();
const path = require('../../path');
const authMiddleware = require(path.middleware.auth);
const lecturerMiddleware = require(path.middleware.lecturer);
const { apiLimiter } = require(path.utils.rateLimiter);

const createBatch = require("../../controllers/v1/lecturer/batches/createBatch");
const getBatches = require("../../controllers/v1/lecturer/batches/getBatches");
const getBatch = require("../../controllers/v1/lecturer/batches/getBatch");
const deleteBatch = require("../../controllers/v1/lecturer/batches/deleteBatch");

router.get("/", authMiddleware, lecturerMiddleware, apiLimiter, getBatches);
router.get("/:id", authMiddleware, lecturerMiddleware, apiLimiter, getBatch);
router.post("/", authMiddleware, lecturerMiddleware, apiLimiter, createBatch);
router.delete("/:id", authMiddleware, lecturerMiddleware, apiLimiter, deleteBatch);

module.exports = router;
