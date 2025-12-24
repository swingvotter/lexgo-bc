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
const caseRouter = require("./routes/caseRoutes")

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
app.use("/api/Cases", caseRouter)

app.get("/test",authMiddleware,(req,res)=>{
    res.send("hello world")
})

const productSchema = require("./validators/createProd")

app.post("/joi",(req,res)=>{
    const {error,value} = productSchema.validate(req.body,{abortEarly:true,allowUnknown:false})
    
    if(error){
        return res.status(400).json({message:"error from joi" + error.message})
    }
    return res.status(200).json({data:value})
})

module.exports = app