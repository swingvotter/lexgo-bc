const AdminCase = require("../../../models/admin/adminCase.Model");
const updateCaseSchema = require("../../../validators/caseValidators/updateCaseValidator");

const updateCase = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Case ID is required" });
    }

    // Step 1: Validate request body
    const { error, value } = updateCaseSchema.validate(req.body || {}, {
      abortEarly: false,
      allowUnknown: false,
    });

    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.message });
    }

    // `.min(1)` already enforces this, but extra safety is fine
    if (Object.keys(value).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "At least one field must be provided to update" });
    }

    // Step 2: Check for duplicates
    if (value.title || value.citation) {
      const duplicate = await AdminCase.findOne({
        _id: { $ne: id },
        $or: [
          value.title ? { title: value.title } : null,
          value.citation ? { citation: value.citation } : null,
        ].filter(Boolean),
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "Another case with this title or citation already exists",
        });
      }
    }

    // Step 3: Update
    const updatedCase = await AdminCase.findByIdAndUpdate(
      id,
      { $set: value },
      { new: true, runValidators: true }
    );

    if (!updatedCase) {
      return res
        .status(404)
        .json({ success: false, message: "Case not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Case successfully updated",
      data: updatedCase,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: err.message });
  }
};

module.exports = updateCase;
