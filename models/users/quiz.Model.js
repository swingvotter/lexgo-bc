
const mongoose = require("mongoose");

// Production-ready AI History Schema
const quizSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Every history must be linked to a user
      index: true,    // Helps with queries by user
    },
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000, // Prevent overly large questions
    },
    answers: {
      type: [String],
      required: true,
      trim: true,
    },
    correctAnswer: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000, // Prevent overly large responses
    }
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Compound index for efficient sorting by user and creation date
quizSchema.index({ userId: 1, createdAt: -1 });

const Quiz = mongoose.model("Quiz",quizSchema) 
module.exports = Quiz