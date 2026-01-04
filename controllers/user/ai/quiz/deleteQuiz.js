const Quiz = require("../../../../models/users/quiz.Model");
const mongoose = require("mongoose");

const deleteQuizHandler = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.userInfo.id;

    if (!quizId) {
      return res.status(400).json({
        message: "quizId is required",
      });
    }

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized: login required",
      });
    }

    let userIdObjectId = userId;
    if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
      userIdObjectId = new mongoose.Types.ObjectId(userId);
    }

    const quiz = await Quiz.findOneAndDelete({
      _id: quizId,
      userId: userIdObjectId,
    });

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found or access denied",
      });
    }

    res.status(200).json({
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    console.error("Delete quiz error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = deleteQuizHandler;



