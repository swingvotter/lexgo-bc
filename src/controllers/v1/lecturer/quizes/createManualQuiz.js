const path = require('../../../../path');
const LecturerQuiz = require(path.models.lecturer.quiz);
const checkCourseAccess = require(path.utils.checkCourseAccess);
const AppError = require(path.error.appError);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);


/**
 * Create a new quiz manually
 * 
 * @route POST /api/LecturerQuiz/create/manual
 * @access Private (Lecturer or Sub-Lecturer)
 */
const createManualQuiz = async (req, res) => {
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
        questions
    } = req.body || {};

    const lecturerId = req.userInfo?.id;

    if (!lecturerId || !courseId || !title || !quizDuration || !quizStartTime) {
        logger.warn("Quiz manual missing fields", { lecturerId, courseId });
        throw new AppError("Missing required fields", 400);
    }

    // Check if user has access to this course (owner or sub-lecturer)
    const { hasAccess, course } = await checkCourseAccess(courseId, lecturerId);

    if (!course) {
        logger.warn("Quiz manual course missing", { courseId, lecturerId });
        throw new AppError("Course not found", 404);
    }

    if (!hasAccess) {
        logger.warn("Quiz manual denied", { courseId, lecturerId });
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

    // 2. Validate Questions
    const questionsData = typeof questions === 'string'
        ? await Promise.resolve()
            .then(() => JSON.parse(questions))
            .catch(() => {
                logger.warn("Quiz manual invalid questions", { lecturerId, courseId });
                throw new AppError("Invalid questions format", 400);
            })
        : questions;

    const questionsToSave = (Array.isArray(questionsData) && questionsData.length > 0)
        ? questionsData.map(q => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            mark: q.mark || 1
        })) : [];

    // 3. Create the Quiz Entry with Questions embedded
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
        questions: questionsToSave,
        status: "completed"
    });

    logger.info("Quiz manual created", { quizId: newQuiz?._id, courseId, lecturerId });
    return res.status(201).json({
        success: true,
        message: "Quiz created manually successfully",
        quiz: newQuiz
    });
};

module.exports = asyncHandler(createManualQuiz);
