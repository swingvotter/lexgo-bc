const path = require('../../../../path');
const LecturerQuiz = require(path.models.lecturer.quiz);
const lecturerQuizQueue = require(path.queues.v1.lecturerQuiz);
const extractText = require(path.utils.textExtractor);
const checkCourseAccess = require(path.utils.checkCourseAccess);
const AppError = require(path.error.appError);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

/**
 * Create a new quiz automatically from document
 * 
 * @route POST /api/LecturerQuiz/create/auto
 * @access Private (Lecturer)
 */
const createAutoQuiz = async (req, res) => {
    const {
        courseId,
        title,
        description,
        quizDuration,
        quizStartTime,
        attempts,
        grade,
        shuffleQuestions,
        shuffleAnswers,
        showScoresImmediately,
        numberOfQuestions,
        difficultyLevel
    } = req.body || {};

    const lecturerId = req.userInfo?.id;

    if (!lecturerId || !courseId || !title || !quizDuration || !quizStartTime) {
        logger.warn("Quiz auto missing fields", { lecturerId, courseId });
        throw new AppError("Missing required fields", 400);
    }

    // Check if user has access to this course (owner or sub-lecturer)
    const { hasAccess, course } = await checkCourseAccess(courseId, lecturerId);

    if (!course) {
        logger.warn("Quiz auto course missing", { courseId, lecturerId });
        throw new AppError("Course not found", 404);
    }

    if (!hasAccess) {
        logger.warn("Quiz auto denied", { courseId, lecturerId });
        throw new AppError("You do not have access to this course", 403);
    }

    // 1. Sanitize and Calculate Timings
    const now = new Date();
    let startTime = new Date(quizStartTime);

    // If startTime is in the past or invalid, set it to 'now'
    if (isNaN(startTime.getTime()) || startTime < now) {
        startTime = now;
    }

    const durationInMs = parseInt(quizDuration) * 60 * 1000;
    let endTime;

    if (req.body?.quizEndTime) {
        endTime = new Date(req.body.quizEndTime);
        // If endTime is before or equal to startTime, or invalid, calculate it based on duration
        if (isNaN(endTime.getTime()) || endTime <= startTime) {
            endTime = new Date(startTime.getTime() + durationInMs);
        }
    } else {
        endTime = new Date(startTime.getTime() + durationInMs);
    }

    // 2. Validate File existence strictly
    if (!req.file) {
        logger.warn("Quiz auto missing file", { courseId, lecturerId });
        throw new AppError("Document file is required for automatic creation", 400);
    }

    // 3. Create the Quiz Entry
    const newQuiz = await LecturerQuiz.create({
        lecturerId,
        courseId: course._id, // Use validated ID
        title,
        description,
        quizDuration,
        quizStartTime: startTime,
        quizEndTime: endTime,
        attempts,
        grade: typeof grade === 'string' ? JSON.parse(grade) : grade,
        shuffleQuestions: shuffleQuestions === 'true' || shuffleQuestions === true,
        shuffleAnswers: shuffleAnswers === 'true' || shuffleAnswers === true,
        showScoresImmediately: showScoresImmediately === 'true' || showScoresImmediately === true,
    });

    // 4. Extract Text from File
    const textContent = await Promise.resolve()
        .then(() => extractText({
            buffer: req.file.buffer,
            originalname: req.file.originalname
        }))
        .catch(async () => {
            logger.warn("Quiz auto text extract failed", { quizId: newQuiz?._id, lecturerId });
            await LecturerQuiz.findByIdAndDelete(newQuiz._id); // Rollback
            throw new AppError("Failed to extract text from document", 500);
        });

    if (!textContent || textContent.trim().length === 0) {
        logger.warn("Quiz auto text empty", { quizId: newQuiz?._id, lecturerId });
        await LecturerQuiz.findByIdAndDelete(newQuiz._id);
        throw new AppError("Extracted text is empty", 400);
    }

    // 5. Add to Worker Queue
    const numQ = parseInt(numberOfQuestions) || 10;

    const job = await Promise.resolve()
        .then(() => lecturerQuizQueue.add("generate-quiz-from-doc", {
            quizId: newQuiz._id,
            lecturerId,
            courseId: course._id, // Use validated ID
            textContent,
            numQuestions: numQ,
            difficultyLevel: difficultyLevel || "Mixed"
        }, {
            attempts: 3,
            backoff: { type: "exponential", delay: 2000 }
        }))
        .catch(async () => {
            logger.warn("Quiz auto queue failed", { quizId: newQuiz?._id, lecturerId });
            await LecturerQuiz.findByIdAndDelete(newQuiz._id);
            throw new AppError("Server error starting generation process", 500);
        });

    logger.info("Quiz auto created", { quizId: newQuiz?._id, courseId, lecturerId });
    return res.status(202).json({
        success: true,
        message: "Quiz creation started. Processing document...",
        quizId: newQuiz._id,
        jobId: job.id
    });
};

module.exports = asyncHandler(createAutoQuiz);
