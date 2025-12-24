const mongoose = require("mongoose");
const Case = require("../../../models/casesModel");

const getCaseById = async (req, res) => {
  try {
    const { id } = req.params;

    // Step 1: Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid case ID",
      });
    }

    // Step 2: Find the case by ID
    const foundCase = await Case.findById(id).lean();

    if (!foundCase) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    // Step 3: Return the case
    return res.status(200).json({
      success: true,
      data: foundCase,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = getCaseById;
