require("dotenv").config()
const express = require("express");
const app = express()
const cookieParser = require("cookie-parser")
const helmet = require("helmet")
const authMiddleware = require("./middleware/authMiddleware")
const cors = require("cors")

const AuthRouter = require("./routes/authRoutes")
const AdminRouter = require("./routes/admin.Routes")
const AiRouter = require("./routes/Ai.Routes")
const noteRouter = require("./routes/noteRoutes")
const axios = require("axios")
const chatGpt = require("./utils/chatGpt")


chatGpt("briefly explain the constitution of ghana")

app.use(cors({
    origin:true,
    credentials:true
}))

app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

// Trust proxy - required for Render, Heroku, etc.
app.set('trust proxy', 1)

//ROUTES START HERE
app.use("/api/Auth",AuthRouter)
app.use("/api/Ai", AiRouter)
app.use("/api/Admin", AdminRouter)
app.use("/api/Notes", noteRouter)

app.get("/test",authMiddleware,(req,res)=>{
    res.send("hello world")
})

module.exports = app