const mongoose = require("mongoose")

const resourceContentSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    }
  },
  { timestamps: true }
);


const ResourceContent = mongoose.model("ResourceContent",resourceContentSchema)
module.exports = ResourceContent


