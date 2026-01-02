import mongoose from "mongoose";

const { Schema } = mongoose;

const courseMaterialSchema = new Schema(
  {
    lecturerId:{type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true
        },
    courseId:{type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
          required: true
        },
    // 1. COURSE TITLE
    title: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },

    // 2. INTRODUCTION
    introduction: {
      type: String,
      required: true
    },

    // 3. CHAPTERS
    chapters: [
      {
        // CHAPTER TITLE
        title: {
          type: String,
          required: true,
          trim: true
        },

        // 4. LEARNING OBJECTIVES
        learningObjectives: [String],

        // 5. CONTENT (NOTES)
        content: {
          type: String,
          required: true
        },

        // 6. AUTHORITIES (simplified & flexible)
        authorities: [
          {
            type: {
              type: String, 
              required: true
            },

            reference: String,  
            // e.g. "Article 58(1) of the 1992 Constitution"
            // e.g. "Section 50(1) of Land Act, 2020 (Act 1036)"
            // e.g. "KHAN v. GODFRED (2025) GLR 112"

            note: String
          }
        ]
      }
    ]
  },
  { timestamps: true }
);

const CourseMaterial =  mongoose.model("CourseMaterial", courseMaterialSchema);
module.exports = CourseMaterial