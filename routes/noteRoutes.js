const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/authMiddleware")
const getNotes = require("../controllers/notes/getNotes")
const getNote = require("../controllers/notes/getNote")
const createNote = require("../controllers/notes/createNote")
const deleteNote = require("../controllers/notes/deleteNote")
const updateNote = require("../controllers/notes/updateNote")

router.get("/",authMiddleware,getNotes)
router.get("/:id",authMiddleware,getNote)
router.post("/",authMiddleware,createNote)
router.delete("/:id",authMiddleware,deleteNote)
router.patch("/:id",authMiddleware,updateNote)


module.exports = router
