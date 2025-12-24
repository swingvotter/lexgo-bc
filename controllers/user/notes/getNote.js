const mongoose = require("mongoose");
const Note = require("../../../models/users/noteModel");

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
