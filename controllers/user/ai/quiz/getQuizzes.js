const Quiz = require("../../../../models/users/quiz.Model");
const mongoose = require("mongoose");
const getPagination = require("../../../../utils/pagination");

const getQuizzesHandler = async (req, res) => {
  try {
    const userId = req.userInfo.id;

    let userIdObjectId = userId;
    if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
      userIdObjectId = new mongoose.Types.ObjectId(userId);
    }

    const { page, limit, skip } = getPagination(req.query);

    const query = { userId: userIdObjectId };

    if (req.query.completed !== undefined) {
      query.completed = req.query.completed === 'true';
    }

    if (req.query.difficultyLevel) {
      const allowedLevels = ["easy", "medium", "hard"];
      if (allowedLevels.includes(req.query.difficultyLevel)) {
        query.difficultyLevel = req.query.difficultyLevel;
      }
    }

    const [quizzes, totalItems] = await Promise.all([
      Quiz.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v')
        .lean(),
      Quiz.countDocuments(query)
    ]);

    const totalPages = totalItems > 0 ? Math.ceil(totalItems / limit) : 0;

    res.status(200).json({
      message: "Quizzes retrieved successfully",
      quizzes,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        startIndex: totalItems > 0 ? (page - 1) * limit + 1 : 0,
        endIndex: Math.min(page * limit, totalItems)
      },
    });
  } catch (error) {
    console.error("Get quizzes error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = getQuizzesHandler;

