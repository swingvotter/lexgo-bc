const path = require('../../../../../path');
const Quiz = require(path.models.users.quiz);
const User = require(path.models.users.user);

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
    await quiz.save();

    const allCompletedQuizzes = await Quiz.find({
      userId,
      completed: true,
    });

    const totalQuizzes = allCompletedQuizzes.length;
    const totalPercentageSum = allCompletedQuizzes.reduce((sum, q) => {
      return sum + (q.score / q.totalQuestions) * 100;
    }, 0);
    const averageScore = totalQuizzes > 0 ? Math.round((totalPercentageSum / totalQuizzes) * 100) / 100 : 0;

    await User.findByIdAndUpdate(userId, {
      "quizStatistics.studentGeneratedQuiz.totalQuizzes": totalQuizzes,
      "quizStatistics.studentGeneratedQuiz.averageScore": averageScore,
    });

    res.status(200).json({
      message: "Quiz score submitted successfully",
      quiz: {
        quizId: quiz._id,
        score: quiz.score,
        totalQuizzes,
        averageScore,
      },
    });
  } catch (error) {
    console.error("Submit quiz scores error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = submitQuizScoresHandler;

