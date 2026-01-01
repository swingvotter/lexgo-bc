const cloudinary = require("../config/cloudinary")


const uploadPdfBufferToCloudinary = (buffer)=>{
    return new Promise((resolve,reject)=>{
        const stream = cloudinary.uploader.upload_stream({folder:"lexgo-bc-resources",resource_type:"raw",type: "private"},(error,result)=>{
            if(error) return reject(error)
                resolve(result)
        })
        stream.end(buffer)
    })
}

const uploadImageBufferToCloudinary = (buffer)=>{
    return new Promise((resolve,reject)=>{
        const stream = cloudinary.uploader.upload_stream({folder:"lexgo-bc-images",resource_type:"image"},(error,result)=>{
            if(error) return reject(error)
                resolve(result)
        })
        stream.end(buffer)
    })
}

module.exports = {uploadPdfBufferToCloudinary,uploadImageBufferToCloudinary}

