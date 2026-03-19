const path = require('../../../../../path');
const User = require(path.models.users.user);
const Course = require(path.models.lecturer.course);
const cursorPagination = require(path.utils.cursorPagination);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

const fetchLecturers = async (req, res) => {
    const limit = Number(req.query.limit || 25);
    const cursor = req.query.cursor || null;
    const deanUniversity = req.userInfo?.university;

    const query = { 
        role: "lecturer",
        university: deanUniversity
    };

    if (req.query.search && typeof req.query.search === "string") {
        const searchTerm = req.query.search.trim();
        if (searchTerm.length > 0) {
            query.$text = { $search: searchTerm };
        }
    }

    const [result, totalLecturers, totalCourses] = await Promise.all([
        cursorPagination({
            model: User,
            filter: query,
            limit,
            cursor,
            projection: { firstName: 1, lastName: 1, email: 1, university: 1, createdAt: 1 },
            sort: { _id: -1 },
        }),
        User.countDocuments(query),
        Course.countDocuments({ lecturerId: { $exists: true } })
    ]);

    const lecturerIds = result.data.map(l => l._id);
    const courseCounts = await Course.aggregate([
        { $match: { lecturerId: { $in: lecturerIds } } },
        { $group: { _id: "$lecturerId", count: { $sum: 1 } } }
    ]);

    const countMap = courseCounts.reduce((acc, curr) => {
        acc[curr._id.toString()] = curr.count;
        return acc;
    }, {});

    const lecturersWithCourses = result.data.map(lecturer => ({
        _id: lecturer._id,
        firstName: lecturer.firstName,
        lastName: lecturer.lastName,
        email: lecturer.email,
        university: lecturer.university,
        numberOfCourses: countMap[lecturer._id.toString()] || 0,
        createdAt: lecturer.createdAt
    }));

    logger.info("Lecturers fetched", { 
        deanId: req.userInfo?.id,
        university: deanUniversity,
        count: lecturersWithCourses.length, 
        total: totalLecturers 
    });

    return res.status(200).json({
        success: true,
        message: "Lecturers fetched successfully",
        data: lecturersWithCourses,
        totalLecturers,
        totalCourses,
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
    });
};

module.exports = asyncHandler(fetchLecturers);
