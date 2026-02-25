const path = require('../../../../path');
const AdminCase = require(path.models.admin.case);
const createCaseSchema = require(path.validators.v1.admin.createCase);

const createCase = async (req, res) => {
  try {
    const { error, value } = createCaseSchema.validate(req.body || {}, {
      abortEarly: false,
      allowUnknown: false,
    });

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    // Step 2: Check for duplicates in DB
    const existingCase = await AdminCase.findOne({
      $or: [
        { title: value.title },
        { citation: value.citation },
      ],
    });

    if (existingCase) {
      return res
        .status(409) // 409 Conflict
        .json({ success: false, message: "Case with this title or citation already exists" });
    }

    // Step 3: Create new case
    const newCase = await AdminCase.create(value);

    return res.status(201).json({ success: true, message: "case succesfully created", data: newCase });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = createCase;
