const mongoose = require("mongoose");
const path = require('../../../../path');
const LecturerCase = require(path.models.lecturer.case);
const Course = require(path.models.lecturer.course);
const { uploadPdfBufferToCloudinary } = require(path.utils.cloudinaryUploader);
const checkCourseAccess = require(path.utils.checkCourseAccess);
const CaseQuiz = require(path.models.lecturer.caseQuiz);
const caseQuizQueue = require(path.queues.v1.caseQuiz);

const createCase = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { title, sourceOfCase, caseCode, caseCategory } = req.body || {};
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

        // --- Start Database Transaction ---
        session.startTransaction();

        // Create the Case first
        const [newCase] = await LecturerCase.create([{
            lecturerId,
            courseId,
            title,
            sourceOfCase,
            caseCode,
            caseCategory,
            caseDocumentPublicId,
            documentFileName: req.file.originalname,
            documentMimeType: req.file.mimetype
        }], { session });

        // Initialize CaseQuiz record (pending)
        await CaseQuiz.create([{
            caseId: newCase._id,
            status: "pending"
        }], { session });

        await session.commitTransaction();

        // Queue background job for AI quiz generation (Outside transaction)
        try {
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
        } catch (queueErr) {
            console.error("Queueing case quiz job failed:", queueErr);
            // Cleanup: remove the case and its quiz entry since the process failed to start
            await CaseQuiz.findOneAndDelete({ caseId: newCase._id });
            await LecturerCase.findByIdAndDelete(newCase._id);
            return res.status(500).json({ success: false, message: "Server error starting quiz generation" });
        }

        return res.status(201).json({
            success: true,
            message: "Case created successfully. Quiz is being generated in the background.",
            data: newCase
        });

    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        console.error("Create case error:", error);
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    } finally {
        session.endSession();
    }
};

module.exports = createCase;
