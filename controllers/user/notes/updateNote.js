const mongoose = require("mongoose");
const Note = require("../../../models/noteModel");

const updateNote = async (req, res) => {
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

    const { title, legalTopic, importanceLevel, content } = req.body;

    // Check if at least one field is provided for update
    if (!title && !legalTopic && !importanceLevel && !content) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required to update",
      });
    }

    // Build update object with only provided fields
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
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Note updated successfully",
      data: note,
    });
  } catch (error) {
    console.error("Update note error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update note. Please try again.",
    });
  }
};

module.exports = updateNote;
