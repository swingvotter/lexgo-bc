
const mongoose = require("mongoose")

async function connectDb() {
    try{
        await mongoose.connect(process.env.MONGODB_URI, {
            maxPoolSize: 100,        // Maximum number of connections in the pool
            minPoolSize: 10,         // Minimum number of connections to maintain
            maxIdleTimeMS: 30000,    // Close connections idle for 30 seconds
            serverSelectionTimeoutMS: 5000, // Timeout after 5s if no server available
            socketTimeoutMS: 45000,  // Close sockets after 45s of inactivity
            family: 4                // Use IPv4, skip trying IPv6
        })
        console.log("database connected successfully with connection pooling (min: 10, max: 100)");
        
    }catch(err){
        console.error("Database connection error:", err);
        process.exit(1); // Exit on connection failure
    }
}

module.exports = connectDb


