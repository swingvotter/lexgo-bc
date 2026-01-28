const { Worker } = require("bullmq");
const redis = require("../config/redis");
const CaseQuiz = require("../models/lecturer/caseQuiz.Model");
const lecturerQuizGenerator = require("../utils/ai/lecturerQuizGenerator");
const extractText = require("../utils/textExtractor");

let caseQuizWorker = null;

function createCaseQuizWorker() {
    if (caseQuizWorker) return caseQuizWorker;

    caseQuizWorker = new Worker(
        "case-quiz-generation",
        async (job) => {
            const { file, caseId } = job.data;

            console.log(`Processing background quiz generation for Case ID: ${caseId}`);

            try {
                // 1. Extract Text
                const textContent = await extractText({
                    buffer: Buffer.from(file.buffer, 'base64'),
                    originalname: file.originalname
                });

                if (!textContent) {
                    throw new Error("Could not extract text from document");
                }

                // 2. Determine dynamic question count based on document length
                // Average word count = text length / 5
                const wordCount = textContent.split(/\s+/).length;
                let numQuestions = Math.floor(wordCount / 300);
                numQuestions = Math.min(Math.max(numQuestions, 3), 10); // Between 3 and 10 questions

                console.log(`Generating ${numQuestions} questions for Case ID: ${caseId} (Word count: ${wordCount})`);

                // 3. Generate Quiz
                const aiResponse = await lecturerQuizGenerator(
                    textContent,
                    numQuestions,
                    "Intermediate"
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

                const questionsToSave = parsed.questions.map((q) => ({
                    question: q.question,
                    options: q.options,
                    correctAnswer: q.correct_answer || q.correctAnswer,
                    explanation: q.explanation || "",
                }));

                // 4. Update CaseQuiz model
                await CaseQuiz.findOneAndUpdate(
                    { caseId },
                    {
                        $set: {
                            questions: questionsToSave,
                            status: "completed"
                        }
                    }
                );

                console.log(`Successfully generated ${questionsToSave.length} questions for Case ID: ${caseId}`);
                return { success: true, count: questionsToSave.length };

            } catch (error) {
                console.error(`Error processing background quiz for Case ID: ${caseId}`, error);
                await CaseQuiz.findOneAndUpdate(
                    { caseId },
                    { $set: { status: "failed" } }
                );
                throw error;
            }
        },
        {
            connection: redis,
            concurrency: 5,
            lockDuration: 60000, // 60 seconds to allow for deep AI analysis
            stalledInterval: 30000, // Check for stalled jobs every 30 seconds
        }
    );

    caseQuizWorker.on("completed", (job) => {
        console.log(`Case Quiz job ${job.id} completed`);
    });

    caseQuizWorker.on("failed", (job, err) => {
        console.error(`Case Quiz job ${job.id} failed:`, err.message);
    });

    return caseQuizWorker;
}

module.exports = createCaseQuizWorker;
