const path = require('../../../../path');
const CourseMaterial = require(path.models.lecturer.courseMaterial);
const getPagination = require(path.utils.pagination);

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
  try {
    const courseId = req.params?.courseId;
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "courseId is required",
      });
    }

    const { page, limit, skip } = getPagination(req.query);

    // Fetch materials with pagination, sorted by newest first
    const [materials, total] = await Promise.all([
      CourseMaterial.find({ courseId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CourseMaterial.countDocuments({ courseId })
    ]);

    const pagination = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };

    return res.status(200).json({
      success: true,
      data: materials,
      pagination,
    });
  } catch (error) {
    console.error("Get course materials error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = getCourseMaterialsHandler;

