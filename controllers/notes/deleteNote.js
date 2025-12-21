const mongoose = require("mongoose");
const Note = require("../../models/noteModel");

const deleteNote = async (req, res) => {
  try {
    const noteId = req.params.id;
    const userId = req.userInfo?.id;

    if (!noteId) {
      return res.status(400).json({
        success: false,
        message: "Note ID is missing",
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: login required",
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID format",
      });
    }

    const note = await Note.findOneAndDelete({ _id: noteId, userId: userId });

    if (!note) {
      return res
        .status(404)
        .json({ success: false, message: "Note not found or unauthorized" });
    }

    return res.status(200).json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Delete note error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete note. Please try again.",
    });
  }
};

module.exports = deleteNote;
