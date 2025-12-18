require("dotenv").config()
const express = require("express");
const app = express()
const cookieParser = require("cookie-parser")
const helmet = require("helmet")
const AuthRouter = require("./routes/authRoutes")
const authMiddleware = require("./middleware/authMiddleware")
const cors = require("cors")


app.use(cors({
    origin:true,
    credentials:true
}))

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(helmet())

// Trust proxy - required for Render, Heroku, etc.
app.set('trust proxy', 1)

//ROUTES START HERE
app.use("/api/Auth",AuthRouter)

app.get("/test",authMiddleware,(req,res)=>{
    res.send("hello world")
})

module.exports = app