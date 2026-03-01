const path = require('../../../../path');
const { createNoteService } = require(path.services.v1.user.createNote);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

/**
 * Create a new personal note
 * 
 * @route POST /api/user/notes
 * @access Private - Requires authentication
 * 
 * @description Allows a user to create a new revision note with title,
 * legal topic, importance level, and content.
 * 
 * @param {string} req.body.title - Note title
 * @param {string} req.body.legalTopic - Associated legal topic
 * @param {string} req.body.importanceLevel - Priority (Low, Medium, High)
 * @param {string} req.body.content - The body content of the note
 * @returns {Object} The created note object
 */
const createNote = async (req, res) => {
  
    const note = await createNoteService({
      userId: req.userInfo?.id,
      title: req.body?.title,
      legalTopic: req.body?.legalTopic,
      importanceLevel: req.body?.importanceLevel,
      content: req.body?.content
    });

    logger.info("Note created", { userId: req.userInfo?.id, noteId: note?._id });

    return res.status(201).json({
      success: true,
      message: "Note created successfully",
      data: note
    });


};

module.exports = asyncHandler(createNote);