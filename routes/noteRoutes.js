const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/authMiddleware")
const { apiLimiter } = require("../utils/rateLimiter")
const getNotes = require("../controllers/notes/getNotes")
const getNote = require("../controllers/notes/getNote")
const createNote = require("../controllers/notes/createNote")
const deleteNote = require("../controllers/notes/deleteNote")
const updateNote = require("../controllers/notes/updateNote")

router.get("/get-all", authMiddleware, apiLimiter, getNotes)
router.get("/get/:id", authMiddleware, apiLimiter, getNote)
router.post("/create", authMiddleware, apiLimiter, createNote)
router.delete("/delete/:id", authMiddleware, apiLimiter, deleteNote)
router.patch("/update/:id", authMiddleware, apiLimiter, updateNote)

module.exports = router
