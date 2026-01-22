const mongoose = require("mongoose");

const subLecturerSchema = new mongoose.Schema(
    {
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },
        lecturerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
    },
    { timestamps: true }
);

// Prevent duplicate requests for same course-lecturer pair
subLecturerSchema.index({ courseId: 1, lecturerId: 1 }, { unique: true });

const SubLecturer = mongoose.model("SubLecturer", subLecturerSchema);
module.exports = SubLecturer;
