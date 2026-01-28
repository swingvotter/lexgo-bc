const mongoose = require("mongoose");

const adminCaseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    citation: { type: String, unique: true, required: true },
    jurisdiction: { type: String, required: true },
    decision: { type: String },
    judgmentDate: { type: Date }, // use Date, not String
    summary: { type: String },
    ratioDecidendi: { type: String },
    obiterDicta: { type: String },
    proceduralHistory: { type: String },

    court: {
      name: { type: String, required: true },
      level: { type: String },
    },

    parties: [
      {
        name: { type: String, required: true },
        role: { type: String, enum: ["Appellant", "Respondent"] },
      },
    ],

    judges: [
      {
        name: { type: String, required: true },
        position: { type: String },
      },
    ],

    legalAuthorities: [
      {
        name: { type: String },
        section: { type: String },
      },
    ],

    precedents: [
      {
        citation: { type: String },
        title: { type: String },
      },
    ],

    keywords: [String],
  },
  { timestamps: true }
);

const AdminCase = mongoose.model("AdminCase", adminCaseSchema, "adminCases");
module.exports = AdminCase;
