const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: [200, "Title too long"],
      trim: true,
    },
    legalTopic: {
      type: String,
      required: [true, "legalTopic is a required field"],
    },
    importanceLevel: {
      type: String,
      enum: ["Low Priority", "Medium Priority", "High Priority"],
      required: [true, "importance level is a required field"],
    },
    content: {
      type: String,
      maxlength: [50000, "Content cannot exceed 50000 characters"],
      required: [true, "content is a required field"],
    },
  },
  { timestamps: true }
);

// Avoid duplicate titles per user for scale and data consistency
noteSchema.index({ userId: 1, title: 1 }, { unique: true });

module.exports = mongoose.model("Note", noteSchema);
