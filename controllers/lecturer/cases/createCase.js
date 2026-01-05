const LecturerCase = require("../../../models/lecturer/cases");
const Course = require("../../../models/lecturer/courses.Model");
const { uploadPdfBufferToCloudinary } = require("../../../utils/CloudinaryBufferUploader");

const createCase = async (req, res) => {
    try {
        const { title, sourceOfCase, caseCode, caseCategory } = req.body;
        const { courseId } = req.params;
        const lecturerId = req.userInfo.id;

        if (!courseId) {
            return res.status(400).json({ success: false, message: "Course ID is required" });
        }

        if (!title || !sourceOfCase || !caseCode || !caseCategory) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Verify course exists AND belongs to this lecturer
        const course = await Course.findOne({ _id: courseId, lecturerId });
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found or unauthorized" });
        }

        // Check if case with same title already exists in this course
        const existingCase = await LecturerCase.findOne({ courseId, title });
        if (existingCase) {
            return res.status(409).json({ success: false, message: "A case with this title already exists in this course" });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: "Case document (PDF) is required" });
        }

        let caseDocumentPublicId = "";

        const uploadResult = await uploadPdfBufferToCloudinary(req.file.buffer);
        if (uploadResult) {
            caseDocumentPublicId = uploadResult.public_id;
        }

        const newCase = await LecturerCase.create({
            lecturerId,
            courseId,
            title,
            sourceOfCase,
            caseCode,
            caseCategory,
            caseDocumentPublicId
        });

        return res.status(201).json({ success: true, message: "Case created successfully", data: newCase });

    } catch (error) {
        console.error("Create case error:", error);
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

module.exports = createCase;
