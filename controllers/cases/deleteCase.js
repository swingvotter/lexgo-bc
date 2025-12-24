const Case = require("../../models/casesModel");

// Delete a case by ID
const deleteCase = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Case ID is required" });
    }

    // Find and delete the case
    const deletedCase = await Case.findByIdAndDelete(id);

    if (!deletedCase) {
      return res
        .status(404)
        .json({ success: false, message: "Case not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Case successfully deleted",
      data: deletedCase,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message });
  }
};

module.exports = deleteCase;
