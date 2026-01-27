const LecturerCase = require("../../../models/lecturer/cases");
const Course = require("../../../models/lecturer/courses.Model");
const { uploadPdfBufferToCloudinary } = require("../../../utils/CloudinaryBufferUploader");
const checkCourseAccess = require("../../../utils/checkCourseAccess");
const CaseQuiz = require("../../../models/lecturer/caseQuiz.Model");
const caseQuizQueue = require("../../../queues/caseQuizQueue");

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

        // Check if user has access to this course (owner or sub-lecturer)
        const { hasAccess, course } = await checkCourseAccess(courseId, lecturerId);

        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        if (!hasAccess) {
            return res.status(403).json({ success: false, message: "You do not have access to this course" });
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

        // Create the Case first
        const newCase = await LecturerCase.create({
            lecturerId,
            courseId,
            title,
            sourceOfCase,
            caseCode,
            caseCategory,
            caseDocumentPublicId
        });

        // Initialize CaseQuiz record (pending)
        await CaseQuiz.create({
            caseId: newCase._id,
            status: "pending"
        });

        // Queue background job for AI quiz generation
        // Converting buffer to base64 for job storage in Redis
        await caseQuizQueue.add(
            "generate-case-quiz",
            {
                caseId: newCase._id,
                file: {
                    buffer: req.file.buffer.toString('base64'),
                    originalname: req.file.originalname
                }
            },
            {
                attempts: 2,
                backoff: { type: "exponential", delay: 1000 }
            }
        );

        return res.status(201).json({
            success: true,
            message: "Case created successfully. Quiz is being generated in the background.",
            data: newCase
        });

    } catch (error) {
        console.error("Create case error:", error);
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

module.exports = createCase;
