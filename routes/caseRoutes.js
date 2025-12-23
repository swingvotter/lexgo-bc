const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/authMiddleware")

router.get("/",authMiddleware)
router.get("/:id",authMiddleware)
router.post("/",authMiddleware)
router.delete("/:id",authMiddleware)
router.patch("/:id",authMiddleware)


module.exports = router
