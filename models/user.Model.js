const mongoose = require("mongoose");
const validator = require("validator");

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
    default:undefined,
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
    enum:["LL.B","LL.M","M.A","PFD"]
  },
  studentId: {
    type: String,
    // uniqueness is enforced only for students via a partial index below
    validate: {
      validator: function (value) {
        // Only require studentId if role is "student"
        if (this.role === "student" && !value) {
          return false;
        }
        return true;
      },
      message: "Student ID is required for students",
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
  },
  password: {
    type: String,
    select:false
  },
  role: {
    type: String,
    enum: ["student", "lecturer", "admin","judge","lawyer"],
    default: "student",
  },
  onboardingCompleted: {
    type: Boolean,
    default: false,
  },
  progress: {
    lessonsCompleted: { type: Number, default: 0 },
    learningStreak: { type: Number, default: 0 },
    lastActiveDate: { type: Date },
  },
  detectedCountry: {
    type: String,
    trim: true,
    default:undefined,
  },
  // Number of AI questions asked by the user
  askAI: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Enforce unique studentId only for users whose role is student
userSchema.index(
  { studentId: 1 },
  { unique: true, partialFilterExpression: { role: "student" } }
);

const user = mongoose.model("user", userSchema);
module.exports = user;