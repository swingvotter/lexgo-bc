const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    otherName: {
      type: String,
      trim: true,
      default: null,
    },

    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true, // DB-level guarantee
    },

    university: {
      type: String,
      required: true,
      trim: true,
    },

    acadamicLevel: {
      type: String,
      trim: true,
      required: function () {
        return this.role === "student";
      },
    },

    program: {
      type: String,
      trim: true,
      enum: ["LL.B", "LL.M", "M.A", "PFD"],
      required: function () {
        return this.role === "student";
      },
    },

    studentId: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["student", "lecturer", "admin"],
      default: "student",
    },

    onboardingCompleted: {
      type: Boolean,
      default: false,
    },

    progress: {
      lessonsCompleted: { type: Number, default: 0 },
      learningStreak: { type: Number, default: 0 },
      lastActiveDate: { type: Date, default: Date.now },
    },

    detectedCountry: {
      type: String,
      trim: true,
      default: null,
    },

    refreshToken: {
      type: String,
      trim: true,
      default: null,
    },

    askAiCount: {
      type: Number,
      default: 0,
    },

    passwordReset: {
      otp: { type: String, default: null },
      otpExpiry: { type: Date, default: null },
      token: { type: String, default: null },
      tokenExpiry: { type: Date, default: null },
      isVerified: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

/* ===================== INDEXES ===================== */

// Unique studentId only for students
userSchema.index(
  { studentId: 1 },
  { unique: true, partialFilterExpression: { role: "student" } }
);

// Performance & search indexes
userSchema.index({ phoneNumber: 1 }, { unique: true });
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ firstName: 1, lastName: 1 });

module.exports = mongoose.model("User", userSchema);
