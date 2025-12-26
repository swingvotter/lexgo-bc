const Quiz = require("../../../models/users/quiz.Model");
const quizGeneratorGPT = require("../../../utils/ai/quizGenerator");

const generateQuizHandler = async (req, res) => {
  try {
    const { topic, difficultyLevel, numberOfQuiz } = req.body;
    const userId = req.userInfo.id; // assuming auth middleware

    if (!topic || !difficultyLevel || !numberOfQuiz) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 1️⃣ Generate quiz from AI
    const aiResponse = await quizGeneratorGPT(
      topic,
      numberOfQuiz,
      difficultyLevel
    );

    // 2️⃣ Parse AI JSON safely
    let parsed;
    try {
      parsed = JSON.parse(aiResponse);
    } catch (err) {
      return res.status(500).json({
        message: "AI returned invalid format",
      });
    }

    // 3️⃣ Prepare documents for MongoDB
    const quizDocs = parsed.questions.map((q) => ({
      userId,
      topic,
      difficultyLevel,
      numberOfQuiz,
      question: q.question,
      answers: q.answers,
      correctAnswer: q.correctAnswer,
    }));

    // 4️⃣ Save to DB
    const savedQuizzes = await Quiz.insertMany(quizDocs);

    // 5️⃣ Send to frontend
    res.status(201).json({
      message: "Quiz generated successfully",
      quizzes: savedQuizzes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = generateQuizHandler