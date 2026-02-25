const path = require("../../../path");
const AdminCase = require(path.models.admin.case);
const createManyCasesSchema = require(path.validators.v1.admin.createManyCases);

/**
 * Create multiple cases at once
 * 
 * @route POST /api/Admin/cases/bulk
 * @access Private - Admin only
 */
const createManyCases = async (req, res) => {
    try {
        const { error, value } = createManyCasesSchema.validate(req.body || {}, {
            abortEarly: false,
            allowUnknown: false,
        });

        if (error) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: error.details.map(d => d.message)
            });
        }

        const casesToInsert = value;

        // 1. Check for internal duplicates in the request body (citation must be unique)
        const citations = casesToInsert.map(c => c.citation);
        const uniqueCitations = new Set(citations);
        
        if (uniqueCitations.size !== citations.length) {
            return res.status(400).json({
                success: false,
                message: "Duplicate citations found in the request body"
            });
        }

        // 2. Check for duplicates in the database
        const existingCases = await AdminCase.find({
            citation: { $in: citations }
        }).select("citation");

        if (existingCases.length > 0) {
            const existingCitations = existingCases.map(c => c.citation);
            return res.status(409).json({
                success: false,
                message: "Some cases already exist in the database",
                existingCitations
            });
        }

        // 3. Perform bulk insertion
        const newCases = await AdminCase.insertMany(casesToInsert);

        return res.status(201).json({
            success: true,
            message: `${newCases.length} cases successfully created`,
            data: newCases
        });

    } catch (error) {
        console.error("Bulk create cases error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = createManyCases;
