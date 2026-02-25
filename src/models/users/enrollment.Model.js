const mongoose = require("mongoose")

const enrollmentSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course", // reference to courses in the Course collection
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  }
}, { timestamps: true })

const Enrollment = mongoose.model("enrollment", enrollmentSchema)
module.exports = Enrollment