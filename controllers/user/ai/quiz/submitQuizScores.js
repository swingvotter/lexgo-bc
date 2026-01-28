const Quiz = require("../../../../models/users/quiz.Model");

const submitQuizScoresHandler = async (req, res) => {
  try {
    const { score } = req.body || {};
    const quizId = req.params.quizId;
    const userId = req.userInfo.id;

    if (!quizId || score === undefined) {
      return res.status(400).json({
        message: "quizId and score are required",
      });
    }

    if (typeof score !== "number" || score < 0) {
      return res.status(400).json({
        message: "score must be a non-negative number",
      });
    }

    const quiz = await Quiz.findOne({ _id: quizId, userId });

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found or access denied",
      });
    }

    if (quiz.completed) {
      return res.status(400).json({
        message: "Quiz score has already been submitted for this quiz",
      });
    }

    if (score > quiz.totalQuestions) {
      return res.status(400).json({
        message: `score cannot exceed total questions (${quiz.totalQuestions})`,
      });
    }

    quiz.score = score;
    quiz.completed = true;

    const otherCompletedQuizzes = await Quiz.find({
      userId,
      completed: true,
      _id: { $ne: quizId },
    });

    const currentQuizPercentage = (score / quiz.totalQuestions) * 100;
    const otherQuizzesPercentages = otherCompletedQuizzes.map(
      (q) => (q.score / q.totalQuestions) * 100
    );

    const totalQuizzes = otherCompletedQuizzes.length + 1;
    const totalPercentageSum =
      otherQuizzesPercentages.reduce((sum, p) => sum + p, 0) +
      currentQuizPercentage;
    const totalQuizzesScores =
      totalQuizzes > 0 ? totalPercentageSum / totalQuizzes : 0;

    quiz.totalQuizzes = totalQuizzes;
    quiz.totalQuizzesScores = Math.round(totalQuizzesScores * 100) / 100;

    await quiz.save();

    res.status(200).json({
      message: "Quiz score submitted successfully",
      quiz: {
        quizId: quiz._id,
        score: quiz.score,
        totalQuizzes: quiz.totalQuizzes,
        totalQuizzesScores: quiz.totalQuizzesScores,
      },
    });
  } catch (error) {
    console.error("Submit quiz scores error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = submitQuizScoresHandler;

