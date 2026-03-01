 const mongoose = require("mongoose");
const path = require('../../../path');
const Note = require(path.models.users.note);
const { getCache, setCache } = require(path.utils.cachingData);
const AppError = require(path.error.appError);

const getNoteService = async ({ userId, noteId }) => {
  if (!userId) {
    throw new AppError("Unauthorized: user must log in", 401);
  }

  if (!noteId) {
    throw new AppError("Note ID is required", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    throw new AppError("Invalid note ID format", 400);
  }

  const cacheKey = `note:id=${noteId}:userId=${userId}`;
  const cached = await getCache(cacheKey);

  if (cached) {
    return cached;
  }

  const note = await Note.findOne({
    _id: noteId,
    userId: userId,
  });

  if (!note) {
    throw new AppError("Note not found", 404);
  }

  await setCache(cacheKey, note, 120);

  return note;
};

module.exports = { getNoteService };
