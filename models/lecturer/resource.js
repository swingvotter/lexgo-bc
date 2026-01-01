const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    lecturerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    fileName:{type:String},
    fileExtension:{type:String},
    fileSize:{type:String,required:true},
    publicId:{type:String,required:true},
    url:{type:String,required:true},
  },
  { timestamps: true }
);

const Resource = mongoose.model("Resource", resourceSchema);
module.exports = Resource;
