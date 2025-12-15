const app = require("./app")
const connectDb = require("./config/db")

const port = process.env.PORT || 3001


app.listen(port,()=>{
    console.log(`server connected on port ${port}`);
    connectDb()
})