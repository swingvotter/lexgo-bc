const path = require('../../../../path');
const { getNoteService } = require(path.services.v1.user.getNote);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

/**
 * Get a single note by ID
 * 
 * @route GET /api/user/notes/:id
 * @access Private - Requires authentication
 * 
 * @description Retrieves a specific revision note. Ensures the note
 * belongs to the authenticated user.
 * 
 * @param {string} req.params.id - The ID of the note to retrieve
 * @returns {Object} The requested note
 */
const getNote = async (req, res) => {
  const note = await getNoteService({
    userId: req.userInfo?.id,
    noteId: req.params.id
  });

  logger.info("Note fetched", { userId: req.userInfo?.id, noteId: req.params.id });

  return res.status(200).json({
    success: true,
    message: "Note fetched successfully",
    data: note,
  });
};

module.exports = asyncHandler(getNote);
