const mongoose = require("mongoose");
const path = require("../../../path");
const Note = require(path.models.users.note);
const { getCache, setCache } = require(path.utils.cachingData);

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
  try {
    const userId = req.userInfo?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: user must log in",
      });
    }

    const noteId = req.params.id;

    if (!noteId) {
      return res.status(400).json({
        success: false,
        message: "Note ID is required",
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID format",
      });
    }

    // Check cache
    const cacheKey = `note:id=${noteId}:userId=${userId}`;
    const cached = await getCache(cacheKey);

    if (cached) {
      return res.status(200).json({
        success: true,
        message: "Note fetched successfully",
        data: cached,
      });
    }

    // Find note, ensuring it belongs to the user
    const note = await Note.findOne({
      _id: noteId,
      userId: userId,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    // Cache and return
    await setCache(cacheKey, note, 120);

    return res.status(200).json({
      success: true,
      message: "Note fetched successfully",
      data: note,
    });
  } catch (error) {
    console.error("Get note error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch note. Please try again.",
    });
  }
};

module.exports = getNote;
