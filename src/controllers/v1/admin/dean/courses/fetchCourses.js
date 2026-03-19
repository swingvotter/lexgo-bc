const path = require('../../../../../path');
const Course = require(path.models.lecturer.course);
const Enrollment = require(path.models.users.enrollment);
const User = require(path.models.users.user);
const cursorPagination = require(path.utils.cursorPagination);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

/**
 * Fetch all courses with pagination and enrollment counts
 */
const adminFetchCoursesHandler = async (req, res) => {
    const limit = Number(req.query.limit || 25);
    const cursor = req.query.cursor || null;

    const query = {};

    // Search filter using $text index
    if (req.query.search && typeof req.query.search === "string") {
        const searchTerm = req.query.search.trim();
        if (searchTerm.length > 0) {
            query.$text = { $search: searchTerm };
        }
    }

    // Execute queries in parallel
    const [result, totalItems, totalStudents] = await Promise.all([
        cursorPagination({
            model: Course,
            filter: query,
            limit,
            cursor,
            projection: {},
            sort: { _id: -1 },
        }),
        Course.countDocuments(query),
        User.countDocuments({ role: "student" })
    ]);

    const courses = await Course.populate(result.data, {
        path: "lecturerId",
        select: "firstName lastName email profilePicture",
    });

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

    logger.info("Dean fetched courses", { 
        deanId: req.userInfo?.id,
        university: deanUniversity,
        count: coursesWithExtraData.length, 
        limit, 
        cursor 
    });
    return res.status(200).json({
        success: true,
        message: "Courses fetched successfully",
        data: coursesWithExtraData,
        totalStudents, // Added as requested
        totalCourses: totalItems,
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
    });
};

module.exports = asyncHandler(adminFetchCoursesHandler);
