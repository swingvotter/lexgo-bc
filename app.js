require("dotenv").config()
const express = require("express");
const app = express()
const cookieParser = require("cookie-parser")
const helmet = require("helmet")
const xss = require("xss-clean")
const sanitize = require("express-mongo-sanitize")
const authMiddleware = require("./middleware/authMiddleware")
const cors = require("cors")

const AuthRouter = require("./routes/authRoutes")
const AdminRouter = require("./routes/admin.Routes")
const AIRouter = require("./routes/Ai.Routes")


app.use(cors({
    origin:true,
    credentials:true
}))

app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(xss())
app.use(sanitize())

// Trust proxy - required for Render, Heroku, etc.
app.set('trust proxy', 1)

//ROUTES START HERE
app.use("/api/Auth",AuthRouter)
app.use("/api/Ai", AIRouter)
app.use("/api/Admin", AdminRouter)

app.get("/test",authMiddleware,(req,res)=>{
    res.send("hello world")
})

module.exports = app