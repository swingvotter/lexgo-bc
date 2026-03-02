const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    lecturerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
  },
  { timestamps: true }
);

courseSchema.index({ title: 1, _id: -1 });
courseSchema.index({ courseCode: 1, _id: -1 });
courseSchema.index({ category: 1, _id: -1 });

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;
