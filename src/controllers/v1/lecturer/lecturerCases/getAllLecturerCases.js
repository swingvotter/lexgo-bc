const path = require('../../../../path');
const LecturerCase = require(path.models.lecturer.case);
const cursorPagination = require(path.utils.cursorPagination);
const generateSignedUrl = require(path.utils.cloudinaryUrlSigner);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

const getAllLecturerCases = async (req, res) => {
    const { title, category, sortOrder } = req.query;
    // User info from authMiddleware
    const lecturerId = req.userInfo.id;

    const limit = Number(req.query.limit || 25);
    const cursor = req.query.cursor || null;

    const queryObject = { lecturerId };

    if (title) {
        queryObject.title = { $regex: title, $options: "i" };
    }

    if (category) {
        queryObject.caseCategory = { $regex: category, $options: "i" };
    }

    const sortObject = { _id: sortOrder === "asc" ? 1 : -1 };

    const [result, total] = await Promise.all([
        cursorPagination({
            model: LecturerCase,
            filter: queryObject,
            limit,
            cursor,
            projection: {},
            sort: sortObject,
        }),
        LecturerCase.countDocuments(queryObject)
    ]);

    const casesWithUrls = result.data.map(c => ({
        ...(c.toObject ? c.toObject() : c),
        url: c.caseDocumentPublicId ? generateSignedUrl(c.caseDocumentPublicId) : null
    }));

    logger.info("Lecturer cases fetched", { lecturerId, count: casesWithUrls.length, limit, cursor });
    return res.status(200).json({
        success: true,
        count: casesWithUrls.length,
        total,
        data: casesWithUrls,
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
    });
};

module.exports = asyncHandler(getAllLecturerCases);
