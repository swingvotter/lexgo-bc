const Note = require("../../models/noteModel");

const createNote = async (req, res) => {
  try {
    const userId = req.userInfo?.id;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: user must login first" });
    }

    const { title, legalTopic, importanceLevel, content } = req.body;

    if (!title || !legalTopic || !importanceLevel || !content) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

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
