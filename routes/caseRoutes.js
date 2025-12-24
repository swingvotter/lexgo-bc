const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/authMiddleware")
const createCase = require("../controllers/admin/cases/createCase")
const deleteCase = require("../controllers/admin/cases/deleteCase")
const updateCase = require("../controllers/admin/cases/updateCase")
const getAllCases = require("../controllers/admin/cases/getCases")
const getCaseById = require("../controllers/admin/cases/getCase")


router.get("/",getAllCases)
router.get("/:id",getCaseById)
router.post("/",createCase)
router.delete("/:id",deleteCase)
router.patch("/:id",updateCase)


module.exports = router
