// models/lecturer/caseQuiz.js
const mongoose = require("mongoose");

const CaseQuizSchema = new mongoose.Schema({
    caseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LecturerCase",
        required: true,
    },
    questions: [
        {
            question: { type: String, required: true },
            options: [{ type: String, required: true }],
            correctAnswer: { type: String, required: true },
            explanation: { type: String },
        },
    ],
    status: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending",
    }
}, { timestamps: true });

const CaseQuiz = mongoose.model("CaseQuiz", CaseQuizSchema);
module.exports = CaseQuiz;
