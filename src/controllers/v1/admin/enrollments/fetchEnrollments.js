const path = require('../../../../path');
const Enrollment = require(path.models.users.enrollment);
const getPagination = require(path.utils.pagination);

/**
 * Fetch all enrollments with pagination and populated fields
 */
const adminFetchEnrollmentsHandler = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req.query);

        const query = {};

        // Status filter
        if (req.query.status) {
            const allowedStatus = ["pending", "approved", "rejected"];
            if (allowedStatus.includes(req.query.status)) {
                query.status = req.query.status;
            }
        }

        // Execute queries in parallel
        const [enrollments, totalItems] = await Promise.all([
            Enrollment.find(query)
                .populate("userId", "firstName lastName email")
                .populate("course", "title courseCode category level")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Enrollment.countDocuments(query),
        ]);

        const totalPages = totalItems > 0 ? Math.ceil(totalItems / limit) : 0;

        return res.status(200).json({
            success: true,
            message: "Enrollments fetched successfully",
            data: enrollments,
            pagination: {
                page,
                limit,
                totalItems,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
                startIndex: totalItems > 0 ? (page - 1) * limit + 1 : 0,
                endIndex: Math.min(page * limit, totalItems),
            },
        });
    } catch (error) {
        console.error("Fetch enrollments error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch enrollments. Please try again later.",
        });
    }
};

module.exports = adminFetchEnrollmentsHandler;
