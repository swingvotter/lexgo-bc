const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    lecturerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    title: { type: String, required: true },
    coursePublicImageId: { type: String },
    courseImageUrl: { type: String },
    category: { type: String, required: true },
    courseCode: { type: String, required: true },
    institution: { type: String, required: true },
    level: { type: String, required: true },
    description: { type: String, default: "" },

    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],

    // NEW: pending requests
    pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;
