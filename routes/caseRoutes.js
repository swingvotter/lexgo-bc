const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/authMiddleware")
const createCase = require("../controllers/cases/createCase")


router.get("/",authMiddleware)
router.get("/:id",authMiddleware)
router.post("/",createCase)
router.delete("/:id",authMiddleware)
router.patch("/:id",authMiddleware)


module.exports = router
