const mongoose = require("mongoose");

const batchDataSchema = new mongoose.Schema(
  {
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    gpa: {
      type: Number,
      default: null,
    },
    studentLevel: {
      type: String,
      default: null,
      trim: true,
    },
    studentProgram: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { timestamps: true }
);

batchDataSchema.index({ batchId: 1, email: 1 });

const BatchData = mongoose.model("BatchData", batchDataSchema);
module.exports = BatchData;