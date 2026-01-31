const path = require("../../../../path");
const Quiz = require(path.models.users.quiz);
const mongoose = require("mongoose");
const getPagination = require(path.utils.pagination);
const { setCache, getCache, deleteCache} = require(path.utils.cachingData);


const getQuizzesHandler = async (req, res) => {
  try {

    
    const userId = req.userInfo?.id;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    let userIdObjectId = userId;
    if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
      userIdObjectId = new mongoose.Types.ObjectId(userId);
    }
    
    const { page, limit, skip } = getPagination(req.query);
    
    const quizKey = `userQuizzes?Page=${page}&limit=${limit}`;
    const cached = await getCache(quizKey);

    if (cached) {      
        return res.status(200).json({
          message: "cached data",
          data: cached,
        });
      }
    
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

    const pagination = {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      startIndex: totalItems > 0 ? (page - 1) * limit + 1 : 0,
      endIndex: Math.min(page * limit, totalItems),
    };

    await setCache(quizKey, { quizzes, pagination }, 60);

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
