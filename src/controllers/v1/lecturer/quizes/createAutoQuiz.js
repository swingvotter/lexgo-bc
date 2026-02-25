const path = require('../../../../path');
const LecturerQuiz = require(path.models.lecturer.quiz);
const lecturerQuizQueue = require(path.queues.v1.lecturerQuiz);
const extractText = require(path.utils.textExtractor);
const checkCourseAccess = require(path.utils.checkCourseAccess);

/**
 * Create a new quiz automatically from document
 * 
 * @route POST /api/LecturerQuiz/create/auto
 * @access Private (Lecturer)
 */
const createAutoQuiz = async (req, res) => {
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
            numberOfQuestions,
            difficultyLevel
        } = req.body || {};

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
            return res.status(400).json({ success: false, message: "Document file is required for automatic creation" });
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
        let textContent = "";
        try {
            textContent = await extractText({
                buffer: req.file.buffer,
                originalname: req.file.originalname
            });
        } catch (err) {
            console.error("Text extraction failed", err);
            await LecturerQuiz.findByIdAndDelete(newQuiz._id); // Rollback
            return res.status(500).json({ success: false, message: "Failed to extract text from document" });
        }

        if (!textContent || textContent.trim().length === 0) {
            await LecturerQuiz.findByIdAndDelete(newQuiz._id);
            return res.status(400).json({ success: false, message: "Extracted text is empty" });
        }

        // 5. Add to Worker Queue
        const numQ = parseInt(numberOfQuestions) || 10;

        let job;
        try {
            job = await lecturerQuizQueue.add("generate-quiz-from-doc", {
                quizId: newQuiz._id,
                lecturerId,
                courseId: course._id, // Use validated ID
                textContent,
                numQuestions: numQ,
                difficultyLevel: difficultyLevel || "Mixed"
            }, {
                attempts: 3,
                backoff: { type: "exponential", delay: 2000 }
            });
        } catch (queueErr) {
            console.error("Queueing job failed:", queueErr);
            await LecturerQuiz.findByIdAndDelete(newQuiz._id);
            return res.status(500).json({ success: false, message: "Server error starting generation process" });
        }

        return res.status(202).json({
            success: true,
            message: "Quiz creation started. Processing document...",
            quizId: newQuiz._id,
            jobId: job.id
        });

    } catch (error) {
        console.error("Create Auto Quiz Error:", error);
        return res.status(500).json({ success: false, message: "Server error creating quiz" });
    }
};

module.exports = createAutoQuiz;
