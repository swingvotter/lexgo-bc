const mongoose = require("mongoose");

const lectureQuizSchema = new mongoose.Schema({
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

  title: {
    type: String,
    trim: true,
    required: true,
  },

  description: {
    type: String,
    trim: true,
    required: true,
  },

  quizDuration: {
    type: Number, // duration in minutes
    required: true,
  },

  quizStartTime: {
    type: Date,
    required: true,
  },

  quizEndTime: {
    type: Date,
    required: true,
  },

  attempts: {
    type: Number,
    enum: [1, 2, 3, -1], // -1 = unlimited
    required: true,
  },
  shuffleQuestions: {
    type: Boolean,
    default: false,
  },
  shuffleAnswers: {
    type: Boolean,
    default: false,
  },
  showScoresImmediately: {
    type: Boolean,
    default: true,
  },
  grade: {
    markPerQuestion: { type: Number, default: 1 },
    totalMarks: { type: Number, default: 0 },
  },
  questions: [{
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: [{
      type: String,
      required: true,
    }],
    correctAnswer: {
      type: String, // E.g., "A", "B", "C", "D"
      required: true,
    },
    explanation: {
      type: String,
      trim: true,
    },
  }],
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
}, { timestamps: true });

const LecturerQuiz = mongoose.model("LecturerQuiz", lectureQuizSchema);
module.exports = LecturerQuiz;
