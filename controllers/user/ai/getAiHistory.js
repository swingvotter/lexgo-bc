const Joi = require("joi");
const AiHistory = require("../../../models/users/aiHitory.model");
const User = require("../../../models/users/user.Model");

const getAiHistorySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

async function getAiHistoryHandler(req, res) {
  try {
    const userId = req.userInfo.id;

    const payload = {
      page: req.query.page,
      limit: req.query.limit,
    };

    const { error, value } = getAiHistorySchema.validate(payload);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { page, limit } = value;

    // Check user exists
    const userExists = await User.exists({ _id: userId });
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      AiHistory.find({userId})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      AiHistory.countDocuments({ userId: userId }),
    ]);

    return res.status(200).json({
      success: true,
      message: "AI history fetched successfully",
      data: {
        history,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    console.error("Error in getAiHistory controller:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = getAiHistoryHandler;
