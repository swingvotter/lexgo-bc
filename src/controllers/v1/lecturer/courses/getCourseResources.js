const path = require('../../../../path');
const Resource = require(path.models.lecturer.resource);
const Course = require(path.models.lecturer.course);
const mongoose = require("mongoose");
const cursorPagination = require(path.utils.cursorPagination);
const AppError = require(path.error.appError);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

/**
 * Get paginated list of resources (PDFs) for a course
 * 
 * @route GET /api/Courses/resources/:courseId
 * @access Private - Requires authentication
 * 
 * @description Fetches uploaded PDF resources for a course with pagination,
 * sorting, and field selection support.
 * 
 * @param {string} req.params.courseId - The course ID
 * @param {number} [req.query.page=1] - Page number for pagination
 * @param {number} [req.query.limit=20] - Number of items per page (max 100)
 * @param {string} [req.query.sort=-createdAt] - Sort field (prefix with - for desc)
 * @param {string} [req.query.fields] - Comma-separated fields to include
 * @returns {Object} Paginated resources with metadata
 */
const getCourseResourcesHandler = async (req, res) => {
  const courseId = req.params?.courseId;

  // Validate courseId is a valid MongoDB ObjectId
  if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
    logger.warn("Resources invalid course", { courseId });
    throw new AppError("valid courseId is required", 400);
  }

  const limit = Number(req.query.limit || 25);
  const cursor = req.query.cursor || null;
  const sortParam = req.query.sort || "-createdAt";  // Default: newest first
  const sortOrder = sortParam.startsWith("-") ? -1 : 1;
  const select = req.query.fields ? req.query.fields.split(",").join(" ") : "-__v";

  // Verify course exists before fetching resources
  const course = await Course.findById(courseId).select("_id");
  if (!course) {
    logger.warn("Resources course missing", { courseId });
    throw new AppError("course not found", 404);
  }

  // Build query with pagination
  const filter = { courseId };

  // Execute queries in parallel
  const [result, total] = await Promise.all([
    cursorPagination({
      model: Resource,
      filter,
      limit,
      cursor,
      projection: select,
      sort: { _id: sortOrder },
    }),
    Resource.countDocuments(filter)
  ]);

  // Append download URL to each resource pointing to our proxy
  const resourcesWithUrl = result.data.map(resource => ({
    ...(resource.toObject ? resource.toObject() : resource),
    downloadUrl: `/api/Courses/resource/download/${resource._id}`
  }));

  logger.info("Resources fetched", { courseId, count: resourcesWithUrl.length, limit, cursor });
  return res.status(200).json({
    success: true,
    data: resourcesWithUrl,
    total,
    nextCursor: result.nextCursor,
    hasMore: result.hasMore,
  });
};

module.exports = asyncHandler(getCourseResourcesHandler);

