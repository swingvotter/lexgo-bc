const path = require('../../../../path');
const { updateNoteService } = require(path.services.v1.user.updateNote);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

/**
 * Update an existing note
 * 
 * @route PATCH /api/user/notes/:id
 * @access Private - Requires authentication
 * 
 * @description Updates the content or metadata of a specific note.
 * Only provided fields will be updated. Ensures the note belongs to the user.
 * 
 * @param {string} req.params.id - The ID of the note to update
 * @param {string} [req.body.title] - New title
 * @param {string} [req.body.legalTopic] - New legal topic
 * @param {string} [req.body.importanceLevel] - New priority
 * @param {string} [req.body.content] - New content
 * @returns {Object} The updated note object
 */
const updateNote = async (req, res) => {
  const note = await updateNoteService({
    userId: req.userInfo?.id,
    noteId: req.params.id,
    title: req.body?.title,
    legalTopic: req.body?.legalTopic,
    importanceLevel: req.body?.importanceLevel,
    content: req.body?.content
  });

  logger.info("Note updated", { userId: req.userInfo?.id, noteId: req.params.id });

  return res.status(200).json({
    success: true,
    message: "Note updated successfully",
    data: note,
  });
};

module.exports = asyncHandler(updateNote);
