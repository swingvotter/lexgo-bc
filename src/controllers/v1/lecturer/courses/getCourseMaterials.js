const path = require('../../../../path');
const CourseMaterial = require(path.models.lecturer.courseMaterial);
const cursorPagination = require(path.utils.cursorPagination);
const AppError = require(path.error.appError);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

/**
 * Get all AI-generated materials for a course
 * 
 * @route GET /api/Courses/courseMaterials/:courseId
 * @access Private - Requires authentication
 * 
 * @description Fetches all generated study materials (summaries, quizzes, etc.)
 * for a specific course, sorted by most recent first.
 * 
 * @param {string} req.params.courseId - The course ID
 * @returns {Object} Array of course materials
 */
const getCourseMaterialsHandler = async (req, res) => {
  const courseId = req.params?.courseId;
  if (!courseId) {
    logger.warn("Materials missing course");
    throw new AppError("courseId is required", 400);
  }

  const limit = Number(req.query.limit || 25);
  const cursor = req.query.cursor || null;

  // Fetch materials with pagination, sorted by newest first
  const [result, total] = await Promise.all([
    cursorPagination({
      model: CourseMaterial,
      filter: { courseId },
      limit,
      cursor,
      projection: {},
      sort: { _id: -1 },
    }),
    CourseMaterial.countDocuments({ courseId })
  ]);

  logger.info("Materials fetched", { courseId, count: result.data.length, limit, cursor });
  return res.status(200).json({
    success: true,
    data: result.data,
    total,
    nextCursor: result.nextCursor,
    hasMore: result.hasMore,
  });
};

module.exports = asyncHandler(getCourseMaterialsHandler);

