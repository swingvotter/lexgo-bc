const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/authMiddleware")
const getNotes = require("../controllers/user/notes/getNotes")
const getNote = require("../controllers/user/notes/getNote")
const createNote = require("../controllers/user/notes/createNote")
const deleteNote = require("../controllers/user/notes/deleteNote")
const updateNote = require("../controllers/user/notes/updateNote")

router.get("/",authMiddleware,getNotes)
router.get("/:id",authMiddleware,getNote)
router.post("/",authMiddleware,createNote)
router.delete("/:id",authMiddleware,deleteNote)
router.patch("/:id",authMiddleware,updateNote)


module.exports = router
