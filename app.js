require("dotenv").config()
const express = require("express");
const app = express()
const cookieParser = require("cookie-parser")
const helmet = require("helmet")
const AuthRouter = require("./routes/authRoutes")

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(helmet())

//ROUTES START HERE
app.use("/api/Auth",AuthRouter)

app.get("/test",(req,res)=>{
    res.send("hello world")
})

module.exports = app