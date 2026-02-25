const mongoose = require("mongoose");
const path = require('../../../../path');
const AdminCase = require(path.models.admin.case);

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

    // Find the case by ID
    const foundCase = await AdminCase.findById(id).lean();

    if (!foundCase) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

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
