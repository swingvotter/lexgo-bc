const path = require('../../../path');
const logger = require(path.config.logger);
const Note = require(path.models.users.note);
const cursorPagination = require(path.utils.cursorPagination);
const AppError = require(path.error.appError);

const getNotesService = async ({
  userId,
  cursor = null,
  limit = 25,
  topic = null,
  importanceLevel = null,
  search = null
}) => {
  if (!userId) {
    logger.error("Get notes error: Missing user ID in request");
    throw new AppError("Authentication required", 401);
  }

  let filter = { userId };

  if (topic) {
    filter.legalTopic = topic;
  }

  if (importanceLevel) {
    const allowedLevels = ["Low Priority", "Medium Priority", "High Priority"];
    if (allowedLevels.includes(importanceLevel)) {
      filter.importanceLevel = importanceLevel;
    }
  }

  if (search && typeof search === "string") {
    filter.$text = { $search: search };
  }

  return cursorPagination({
    model: Note,
    filter,
    projection: {},
    limit: Number(limit),
    cursor,
    sort: { _id: -1 }
  });
};

module.exports = { getNotesService };
