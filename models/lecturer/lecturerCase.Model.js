const mongoose = require("mongoose");

const CaseSchema = new mongoose.Schema({
  lecturerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  title: { type: String, required: true },
  sourceOfCase: { type: String, required: true },
  caseCode: { type: String, required: true },
  caseCategory: { type: String, required: true },
  caseDocumentPublicId: { type: String },
  documentFileName: { type: String },
  documentMimeType: { type: String },
});

const LecturerCase = mongoose.model("LecturerCase", CaseSchema, "lecturerCases");
module.exports = LecturerCase;
