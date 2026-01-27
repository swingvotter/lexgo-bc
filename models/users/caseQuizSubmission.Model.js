// models/users/caseQuizSubmission.Model.js
const mongoose = require("mongoose");

const caseQuizSubmissionSchema = new mongoose.Schema({
    caseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LecturerCase",
        required: true,
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
    },
    score: {
        type: Number,
        required: true,
    },
    totalPossibleScore: {
        type: Number,
        required: true,
    },
    answers: [{
        questionId: mongoose.Schema.Types.ObjectId,
        selectedOption: String,
        isCorrect: Boolean,
    }],
    completedAt: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true });

caseQuizSubmissionSchema.index({ caseId: 1, studentId: 1 });

const CaseQuizSubmission = mongoose.model("CaseQuizSubmission", caseQuizSubmissionSchema);
module.exports = CaseQuizSubmission;
