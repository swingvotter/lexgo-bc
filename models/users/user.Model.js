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
    lastActiveDate: { type: Date,default:Date.now },
  },
  detectedCountry: {
    type: String,
    trim: true,
    default:undefined,
  },
  refreshToken: {
    type: String,
    trim: true,
    default:null
  },
  askAiCount: {
    type:Number,
    default:0
  },
  passwordReset: {
    otp: { type: String, default: null },           // Hashed OTP
    otpExpiry: { type: Date, default: null },       // OTP expiration time
    token: { type: String, default: null },         // Reset token (after OTP verified)
    tokenExpiry: { type: Date, default: null },     // Token expiration time
    isVerified:{type:Boolean,default:false}
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