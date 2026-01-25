// controllers/admin/courses/fetchCourses.js
const Course = require("../../../models/lecturer/courses.Model");
const Enrollment = require("../../../models/users/enrollment.Model");
const User = require("../../../models/users/user.Model");
const getPagination = require("../../../utils/pagination");

/**
 * Fetch all courses with pagination and enrollment counts
 */
const adminFetchCoursesHandler = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req.query);

        const query = {};

        // Search filter
        if (req.query.search && typeof req.query.search === "string") {
            const searchTerm = req.query.search.trim();
            if (searchTerm.length > 0) {
                const searchRegex = { $regex: searchTerm, $options: "i" };
                query.$or = [
                    { title: searchRegex },
                    { courseCode: searchRegex },
                    { category: searchRegex },
                ];
            }
        }

        // Execute queries in parallel
        const [courses, totalItems, totalStudents] = await Promise.all([
            Course.find(query)
                .populate("lecturerId", "firstName lastName email profilePicture")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Course.countDocuments(query),
            User.countDocuments({ role: "student" })
        ]);

        // Enhance courses with student enrollment count efficiently
        const courseIds = courses.map(c => c._id);
        const enrollmentCounts = await Enrollment.aggregate([
            { $match: { course: { $in: courseIds }, status: "approved" } },
            { $group: { _id: "$course", count: { $sum: 1 } } }
        ]);

        const countMap = enrollmentCounts.reduce((acc, curr) => {
            acc[curr._id.toString()] = curr.count;
            return acc;
        }, {});

        const coursesWithExtraData = courses.map(course => ({
            ...course,
            enrolledStudents: countMap[course._id.toString()] || 0,
        }));
        const totalPages = totalItems > 0 ? Math.ceil(totalItems / limit) : 0;

        return res.status(200).json({
            success: true,
            message: "Courses fetched successfully",
            data: coursesWithExtraData,
            totalStudents, // Added as requested
            totalCourses: totalItems,
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
        console.error("Fetch courses error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch courses. Please try again later.",
        });
    }
};

module.exports = adminFetchCoursesHandler;
