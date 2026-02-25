const path = require('../../../../path');
const Note = require(path.models.users.note);

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
  try {
    const userId = req.userInfo?.id;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: user must login first" });
    }

    const { title, legalTopic, importanceLevel, content } = req.body || {};

    // Validate required fields
    if (!title || !legalTopic || !importanceLevel || !content) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Create the note associated with the user
    const note = await Note.create({ userId, title, legalTopic, importanceLevel, content });

    return res.status(201).json({
      success: true,
      message: "Note created successfully",
      data: note
    });

  } catch (error) {
    console.error("Create note error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create note. Please try again." });
  }
};

module.exports = createNote;
