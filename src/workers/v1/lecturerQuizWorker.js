const { Worker } = require("bullmq");
const redis = require("../../config/redis");
const path = require("../../path");
const LecturerQuiz = require(path.models.lecturer.quiz);
const lecturerQuizGenerator = require(path.utils.ai.lecturerQuizGenerator);

let lecturerQuizWorker = null;

function createLecturerWorker() {
    if (lecturerQuizWorker) return lecturerQuizWorker;

    lecturerQuizWorker = new Worker(
        "lecturer-quiz-generation",
        async (job) => {
            const { textContent, numQuestions, difficultyLevel, quizId, lecturerId, courseId } = job.data;

            console.log(`Processing quiz generation for Quiz ID: ${quizId}`);

            try {
                const aiResponse = await lecturerQuizGenerator(
                    textContent,
                    numQuestions,
                    difficultyLevel || "Mixed"
                );

                let parsed;
                try {
                    parsed = JSON.parse(aiResponse);
                } catch (error) {
                    throw new Error("AI returned invalid JSON format");
                }

                if (!Array.isArray(parsed.questions)) {
                    throw new Error("AI response missing questions array");
                }

                const questionsToSave = parsed.questions.map((q) => {
                    return {
                        question: q.question,
                        options: q.options,
                        correctAnswer: q.correct_answer || q.correctAnswer, // Handle AI variability
                        explanation: q.explanation || "",
                    };
                });

                // Update the existing quiz with the generated questions
                if (questionsToSave.length > 0) {
                    await LecturerQuiz.findByIdAndUpdate(quizId, {
                        $set: {
                            questions: questionsToSave,
                            status: "completed"
                        }
                    });
                }

                console.log(`Successfully generated and saved ${questionsToSave.length} questions for Quiz ID: ${quizId}`);

                return { success: true, count: questionsToSave.length };

            } catch (error) {
                console.error(`Error processing quiz generation for Quiz ID: ${quizId}`, error);
                await LecturerQuiz.findByIdAndUpdate(quizId, {
                    $set: { status: "failed" }
                });
                throw error;
            }
        },
        {
            connection: redis,
            concurrency: 5,
            lockDuration: 60000, // 60 seconds
            stalledInterval: 30000,
        }
    );

    lecturerQuizWorker.on("completed", (job) => {
        console.log(`Lecturer Quiz job ${job.id} completed`);
    });

    lecturerQuizWorker.on("failed", (job, err) => {
        console.error(`Lecturer Quiz job ${job.id} failed:`, err.message);
    });

    lecturerQuizWorker.on("error", (error) => {
        console.error("Lecturer Quiz worker error:", error.message);
    });

    return lecturerQuizWorker;
}

module.exports = createLecturerWorker;
