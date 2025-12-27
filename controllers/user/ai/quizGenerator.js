const Quiz = require("../../../models/users/quiz.Model");
const quizGeneratorGPT = require("../../../utils/ai/quizGenerator");

const generateQuizHandler = async (req, res) => {
  try {
    const { topic, difficultyLevel, numberOfQuiz } = req.body;
    const userId = req.userInfo.id; // from auth middleware

    // 1️⃣ Validate input
    if (!topic || !difficultyLevel || !numberOfQuiz) {
      return res.status(400).json({
        message: "topic, difficultyLevel, and numberOfQuiz are required",
      });
    }

    // 2️⃣ Generate quiz from AI
    const aiResponse = await quizGeneratorGPT(
      topic,
      numberOfQuiz,
      difficultyLevel
    );

    let parsed;
    try {
      parsed = JSON.parse(aiResponse);
    } catch (error) {
      return res.status(500).json({
        message: "AI returned invalid JSON format",
      });
    }

    if (!Array.isArray(parsed.questions)) {
      return res.status(500).json({
        message: "AI response missing questions array",
      });
    }

    // 3️⃣ Normalize questions to match schema
    const questions = parsed.questions.map((q) => ({
      question: q.question,
      options: q.answers, // rename answers → options
      correctAnswer: q.correctAnswer,
      userAnswer: null,
    }));

    // 4️⃣ Create ONE quiz document
    const quiz = await Quiz.create({
      userId,
      topic,
      difficultyLevel,
      totalQuestions: questions.length,
      questions,
    });

    res.status(201).json({
      message: "Quiz generated successfully",
      quiz:quiz._id
    });
  } catch (error) {
    console.error("Quiz generation error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = generateQuizHandler;
