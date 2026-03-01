const path = require('../../../path');
const Note = require(path.models.users.note);
const AppError = require(path.error.appError);

const createNoteService = async ({ userId, title, legalTopic, importanceLevel, content }) => {
  if (!userId) {
    throw new AppError("Unauthorized: user must login first", 401);
  }

  if (!title || !legalTopic || !importanceLevel || !content) {
    throw new AppError("All fields are required", 400);
  }

  return Note.create({ userId, title, legalTopic, importanceLevel, content });
};

module.exports = { createNoteService };
