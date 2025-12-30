const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
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
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
  },
  university: {
    type: String,
    required: true,
    trim: true,
  },
  acadamicLevel: {
    type: String,
    required: true,
    trim: true,
  },
  program: {
    type: String,
    required: true,
    trim: true,
    enum: ["LL.B", "LL.M", "M.A", "PFD"],
  },
  studentId: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String
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
  },
  refreshToken: {
    type: String,
    trim: true,
    default: null,
  },
  askAiCount: {
    type:Number,
    default:0
  },
  passwordReset: {
    otp: { type: String, default: null },
    otpExpiry: { type: Date, default: null },
    token: { type: String, default: null },
    tokenExpiry: { type: Date, default: null },
    isVerified: { type: Boolean, default: false },
  },
},{ timestamps: true });

// Enforce unique studentId only for users whose role is student
userSchema.index(
  { studentId: 1 },
  { unique: true, partialFilterExpression: { role: "student" } }
);

userSchema.index({ createdAt: -1 }); // For sorting
userSchema.index({ email: 1 }); // For search
userSchema.index({ role: 1 }); // For filtering
userSchema.index({ firstName: 1, lastName: 1 }); // For search

const user = mongoose.model("User", userSchema);
module.exports = user;