const path = require("../../../../path");
const Quiz = require(path.models.users.quiz);
const mongoose = require("mongoose");

const getQuizHandler = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.userInfo.id;

    if (!quizId) {
      return res.status(400).json({
        message: "quizId is required",
      });
    }

    let userIdObjectId = userId;
    if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
      userIdObjectId = new mongoose.Types.ObjectId(userId);
    }

    const quiz = await Quiz.findOne({
      _id: quizId,
      userId: userIdObjectId,
    });

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found or access denied",
      });
    }

    res.status(200).json({
      message: "Quiz retrieved successfully",
      quiz,
    });
  } catch (error) {
    console.error("Get quiz error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = getQuizHandler;




