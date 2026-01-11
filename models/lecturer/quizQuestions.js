const mongoose = require("mongoose");

const lectureQuizSchema = new mongoose.Schema(
  {
    lecturerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LecturerQuiz",
      required: true,
    },
    title: {
      type: String,
      trim: true,
    },
    
  },
  { timestamps: true }
);

const LecturerQuiz = mongoose.model("LecturerQuiz", lectureQuizSchema);
module.exports = LecturerQuiz;
