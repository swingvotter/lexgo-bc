const LecturerCase = require("../../../models/lecturer/lecturerCase.Model");
const getPagination = require("../../../utils/pagination");
const generateSignedUrl = require("../../../utils/cloudinaryUrlSigner");

const getCases = async (req, res) => {
    try {
        const { title, category, sortedBy, sortOrder } = req.query;
        const { courseId } = req.params;

        if (!courseId) {
            return res.status(400).json({ success: false, message: "Course ID is required" });
        }

        const { page, limit, skip } = getPagination(req.query);

        const queryObject = { courseId };

        if (title) {
            queryObject.title = { $regex: title, $options: "i" };
        }

        if (category) {
            queryObject.caseCategory = { $regex: category, $options: "i" };
        }

        let sortObject = { _id: "desc" }; // Default sort by newest (using _id)

        if (sortedBy) {
            const direction = sortOrder === "desc" ? "desc" : "asc";
            sortObject = { [sortedBy]: direction };
        }

        const cases = await LecturerCase.find(queryObject)
            .sort(sortObject)
            .skip(skip)
            .limit(limit)
            .lean(); // Convert to plain JavaScript objects

        const casesWithUrls = cases.map(c => ({
            ...c,
            url: c.caseDocumentPublicId ? generateSignedUrl(c.caseDocumentPublicId) : null
        }));

        const total = await LecturerCase.countDocuments(queryObject);

        return res.status(200).json({
            success: true,
            count: casesWithUrls.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: casesWithUrls,
        });

    } catch (error) {
        console.error("Get cases error:", error);
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

module.exports = getCases;
