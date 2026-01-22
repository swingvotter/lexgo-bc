const LecturerQuiz = require("../../../models/lecturer/quizes");
const checkCourseAccess = require("../../../utils/checkCourseAccess");


/**
 * Create a new quiz manually
 * 
 * @route POST /api/LecturerQuiz/create/manual
 * @access Private (Lecturer or Sub-Lecturer)
 */
const createManualQuiz = async (req, res) => {
    try {
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
        } = req.body;

        const lecturerId = req.userInfo?.id;

        if (!lecturerId || !courseId || !title || !quizDuration || !quizStartTime) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Check if user has access to this course (owner or sub-lecturer)
        const { hasAccess, course } = await checkCourseAccess(courseId, lecturerId);

        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        if (!hasAccess) {
            return res.status(403).json({ success: false, message: "You do not have access to this course" });
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

        if (req.body.quizEndTime) {
            endTime = new Date(req.body.quizEndTime);
            // If endTime is before or equal to startTime, or invalid, calculate it based on duration
            if (isNaN(endTime.getTime()) || endTime <= startTime) {
                endTime = new Date(startTime.getTime() + durationInMs);
            }
        } else {
            endTime = new Date(startTime.getTime() + durationInMs);
        }

        // 2. Validate Questions
        let questionsData = [];
        try {
            questionsData = typeof questions === 'string' ? JSON.parse(questions) : questions;
        } catch (e) {
            return res.status(400).json({ success: false, message: "Invalid questions format" });
        }

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
            courseId,
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
            questions: questionsToSave
        });

        return res.status(201).json({
            success: true,
            message: "Quiz created manually successfully",
            quiz: newQuiz
        });

    } catch (error) {
        console.error("Create Manual Quiz Error:", error);
        return res.status(500).json({ success: false, message: "Server error creating quiz" });
    }
};

module.exports = createManualQuiz;
