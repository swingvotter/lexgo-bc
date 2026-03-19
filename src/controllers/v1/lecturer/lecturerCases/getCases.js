const path = require('../../../../path');
const LecturerCase = require(path.models.lecturer.case);
const cursorPagination = require(path.utils.cursorPagination);
const generateSignedUrl = require(path.utils.cloudinaryUrlSigner);
const AppError = require(path.error.appError);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

const getCases = async (req, res) => {
    const { title, category, sortOrder } = req.query;
    const { courseId } = req.params;

    if (!courseId) {
        logger.warn("Cases missing course", { courseId });
        throw new AppError("Course ID is required", 400);
    }

    const limit = Number(req.query.limit || 25);
    const cursor = req.query.cursor || null;

    const queryObject = { courseId };

    if (title || category) {
        const searchTerms = [title, category].filter(Boolean).join(" ");
        queryObject.$text = { $search: searchTerms };
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

    logger.info("Cases fetched", { courseId, count: casesWithUrls.length, limit, cursor });
    return res.status(200).json({
        success: true,
        count: casesWithUrls.length,
        total,
        data: casesWithUrls,
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
    });
};

module.exports = asyncHandler(getCases);
