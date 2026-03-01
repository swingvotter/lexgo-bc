const mongoose = require("mongoose");
const path = require('../../../path');
const Note = require(path.models.users.note);
const AppError = require(path.error.appError);

const deleteNoteService = async ({ userId, noteId }) => {
  if (!noteId) {
    throw new AppError("Note ID is missing", 400);
  }

  if (!userId) {
    throw new AppError("Unauthorized: login required", 401);
  }

  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    throw new AppError("Invalid note ID format", 400);
  }

  const note = await Note.findOneAndDelete({ _id: noteId, userId: userId });

  if (!note) {
    throw new AppError("Note not found or unauthorized", 404);
  }

  return true;
};

module.exports = { deleteNoteService };
