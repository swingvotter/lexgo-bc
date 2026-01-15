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
      unique: true,
      trim: true,
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

    // ✅ ALL USERS
    lastActive: {
      type: Date,
      default: Date.now,
    },

    // ✅ STUDENTS ONLY
    progress: {
      lessonsCompleted: { type: Number, default: 0 },
      learningStreak: { type: Number, default: 1 },
    },
    refreshToken: { type: String, default: null },
    detectedCountry: {
      type: String,
      default: null,
      trim: true,
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

userSchema.pre("save", function () {
  if (this.role === "student") {
    if (!this.progress) {
      this.progress = {
        lessonsCompleted: 0,
        learningStreak: 0,
      };
    }
  } else {
    this.progress = undefined;
  }
});

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
