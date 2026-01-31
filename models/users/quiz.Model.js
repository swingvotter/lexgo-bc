const mongoose = require("mongoose");
const { randomUUID } = require("crypto");

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    options: {
      type: [String],
      required: true,
      validate: v => v.length >= 2,
    },

    correctAnswer: {
      type: String,
      required: true,
      trim: true,
    },
    correctAnswExpl: {
      type: String,
      required: true,
      trim: true,
    },

  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => randomUUID(),
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    topic: {
      type: String,
      required: true,
      trim: true,
    },

    difficultyLevel: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },

    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
    },

    questions: {
      type: [questionSchema],
      required: true,
    },

    score: {
      type: Number,
      default: 0,
    },

    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

quizSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Quiz", quizSchema);
