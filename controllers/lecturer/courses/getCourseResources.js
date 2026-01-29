const path = require("../../../path");
const Resource = require(path.models.lecturer.resource);
const Course = require(path.models.lecturer.course);
const mongoose = require("mongoose");
const getPagination = require(path.utils.pagination);

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
  try {
    const courseId = req.params?.courseId;

    // Validate courseId is a valid MongoDB ObjectId
    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: "valid courseId is required" });
    }

    // Use centralized pagination utility
    const { page, limit, skip } = getPagination(req.query);

    const sort = req.query.sort || "-createdAt";  // Default: newest first
    const select = req.query.fields ? req.query.fields.split(",").join(" ") : "-__v";

    // Verify course exists before fetching resources
    const course = await Course.findById(courseId).select("_id");
    if (!course) {
      return res.status(404).json({ success: false, message: "course not found" });
    }

    // Build query with pagination
    const filter = { courseId };

    // Execute queries in parallel
    const [resources, total] = await Promise.all([
      Resource.find(filter)
        .select(select)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Resource.countDocuments(filter)
    ]);

    // Append download URL to each resource pointing to our proxy
    const resourcesWithUrl = resources.map(resource => ({
      ...resource,
      downloadUrl: `/api/Courses/resource/download/${resource._id}`
    }));

    return res.status(200).json({
      success: true,
      data: resourcesWithUrl,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Get course resources error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = getCourseResourcesHandler;

