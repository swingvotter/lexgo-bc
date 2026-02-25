const express = require("express")
const router = express.Router()
const path = require('../../path')
const authMiddleware = require(path.middleware.auth)
const getNotes = require("../../controllers/v1/user/notes/getNotes")
const getNote = require("../../controllers/v1/user/notes/getNote")
const createNote = require("../../controllers/v1/user/notes/createNote")
const deleteNote = require("../../controllers/v1/user/notes/deleteNote")
const updateNote = require("../../controllers/v1/user/notes/updateNote")

router.get("/", authMiddleware, getNotes)
router.get("/:id", authMiddleware, getNote)
router.post("/", authMiddleware, createNote)
router.delete("/:id", authMiddleware, deleteNote)
router.patch("/:id", authMiddleware, updateNote)


module.exports = router
