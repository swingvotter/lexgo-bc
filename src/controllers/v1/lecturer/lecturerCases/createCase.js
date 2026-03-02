const mongoose = require("mongoose");
const path = require('../../../../path');
const LecturerCase = require(path.models.lecturer.case);
const Course = require(path.models.lecturer.course);
const { uploadPdfBufferToCloudinary } = require(path.utils.cloudinaryUploader);
const checkCourseAccess = require(path.utils.checkCourseAccess);
const CaseQuiz = require(path.models.lecturer.caseQuiz);
const caseQuizQueue = require(path.queues.v1.caseQuiz);
const AppError = require(path.error.appError);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

const createCase = async (req, res) => {
    const session = await mongoose.startSession();
    const { title, sourceOfCase, caseCode, caseCategory } = req.body || {};
    const { courseId } = req.params;
    const lecturerId = req.userInfo.id;
    let newCase;

    if (!courseId) {
        logger.warn("Case missing course", { lecturerId });
        throw new AppError("Course ID is required", 400);
    }

    if (!title || !sourceOfCase || !caseCode || !caseCategory) {
        logger.warn("Case missing fields", { courseId, lecturerId });
        throw new AppError("All fields are required", 400);
    }

    // Check if user has access to this course (owner or sub-lecturer)
    const { hasAccess, course } = await checkCourseAccess(courseId, lecturerId);

    if (!course) {
        logger.warn("Case course missing", { courseId, lecturerId });
        throw new AppError("Course not found", 404);
    }

    if (!hasAccess) {
        logger.warn("Case denied", { courseId, lecturerId });
        throw new AppError("You do not have access to this course", 403);
    }


    // Check if case with same title already exists in this course
    const existingCase = await LecturerCase.findOne({ courseId, title });
    if (existingCase) {
        logger.warn("Case duplicate", { courseId, lecturerId, title });
        throw new AppError("A case with this title already exists in this course", 409);
    }

    if (!req.file) {
        logger.warn("Case missing file", { courseId, lecturerId });
        throw new AppError("Case document (PDF) is required", 400);
    }

    const uploadResult = await uploadPdfBufferToCloudinary(req.file.buffer);
    if (!uploadResult) {
        logger.warn("Case upload failed", { courseId, lecturerId });
        throw new AppError("Case document upload failed", 400);
    }

    const caseDocumentPublicId = uploadResult.public_id;

    await session.withTransaction(async () => {
        // Create the Case first
        [newCase] = await LecturerCase.create([{
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
    }).finally(() => session.endSession());

    logger.info("Case created", { caseId: newCase?._id, courseId, lecturerId });
    return res.status(201).json({
        success: true,
        message: "Case created successfully. Quiz is being generated in the background.",
        data: newCase
    });
};

module.exports = asyncHandler(createCase);
