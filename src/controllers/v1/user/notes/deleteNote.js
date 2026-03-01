const path = require('../../../../path');
const { deleteNoteService } = require(path.services.v1.user.deleteNote);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

/**
 * Delete a personal note
 * 
 * @route DELETE /api/user/notes/:id
 * @access Private - Requires authentication
 * 
 * @description Permanently deletes a revision note. Ensures the note
 * belongs to the authenticated user before deletion.
 * 
 * @param {string} req.params.id - The ID of the note to delete
 * @returns {Object} Success message
 */
const deleteNote = async (req, res) => {
  await deleteNoteService({
    userId: req.userInfo?.id,
    noteId: req.params.id
  });

  logger.info("Note deleted", { userId: req.userInfo?.id, noteId: req.params.id });

  return res.status(200).json({
    success: true,
    message: "Note deleted successfully",
  });
};

module.exports = asyncHandler(deleteNote);
