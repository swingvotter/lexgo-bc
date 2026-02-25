const mongoose = require("mongoose");

const lecturerQuizSubmissionSchema = new mongoose.Schema({
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LecturerQuiz",
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
    attemptNumber: {
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

// Ensure attempt tracking is easier with an index
lecturerQuizSubmissionSchema.index({ quizId: 1, studentId: 1, attemptNumber: 1 }, { unique: true });

const LecturerQuizSubmission = mongoose.model("LecturerQuizSubmission", lecturerQuizSubmissionSchema);
module.exports = LecturerQuizSubmission;
