const mongoose = require("mongoose");
const path = require('../../../path');
const Note = require(path.models.users.note);
const AppError = require(path.error.appError);

const updateNoteService = async ({ userId, noteId, title, legalTopic, importanceLevel, content }) => {
  if (!userId) {
    throw new AppError("Unauthorized: user must log in", 401);
  }

  if (!noteId) {
    throw new AppError("Note ID is required", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    throw new AppError("Invalid note ID format", 400);
  }

  if (!title && !legalTopic && !importanceLevel && !content) {
    throw new AppError("At least one field is required to update", 400);
  }

  const updateFields = {};
  if (title) updateFields.title = title;
  if (legalTopic) updateFields.legalTopic = legalTopic;
  if (importanceLevel) updateFields.importanceLevel = importanceLevel;
  if (content) updateFields.content = content;

  const note = await Note.findOneAndUpdate(
    { _id: noteId, userId: userId },
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  if (!note) {
    throw new AppError("Note not found", 404);
  }

  return note;
};

module.exports = { updateNoteService };
