const path = require('../../../../path');
const Note = require(path.models.users.note)
const getPagination = require(path.utils.pagination)

/**
 * Get all notes with filtering and pagination
 * 
 * @route GET /api/user/notes
 * @access Private - Requires authentication
 * 
 * @description Retrieves a paginated list of user notes. Supports filtering by
 * legal topic, importance level, and keyword search. Also supports sorting.
 * 
 * @param {number} [req.query.page=1] - Page number
 * @param {number} [req.query.limit=10] - Number of items per page
 * @param {string} [req.query.legalTopic] - Filter by topic
 * @param {string} [req.query.importanceLevel] - Filter by priority (Low, Medium, High Priority)
 * @param {string} [req.query.search] - Search keyword for title, content, or topic
 * @param {string} [req.query.sortBy] - Field to sort by
 * @param {string} [req.query.sortOrder] - "asc" or "desc"
 * @returns {Object} Paginated list of notes with metadata
 */
const getNotes = async (req, res) => {
  try {
    const userId = req.userInfo.id

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      })
    }

    // Get pagination parameters
    const { page, limit, skip } = getPagination(req.query)

    // Build query - filter by user's notes only
    const query = { userId }

    // Optional filters: Legal Topic
    if (req.query.legalTopic) {
      query.legalTopic = req.query.legalTopic
    }

    // Optional filters: Importance Level
    if (req.query.importanceLevel) {
      const allowedLevels = ["Low Priority", "Medium Priority", "High Priority"]
      if (allowedLevels.includes(req.query.importanceLevel)) {
        query.importanceLevel = req.query.importanceLevel
      }
    }

    // Search filter (title, content, legalTopic)
    if (req.query.search && typeof req.query.search === "string") {
      const searchTerm = req.query.search.trim()
      if (searchTerm.length > 0) {
        const searchRegex = { $regex: searchTerm, $options: "i" }
        query.$or = [
          { title: searchRegex },
          { content: searchRegex },
          { legalTopic: searchRegex }
        ]
      }
    }

    // Sort validation (prevent NoSQL injection by allowing only specific fields)
    const allowedSortFields = ["createdAt", "updatedAt", "title", "importanceLevel", "legalTopic"]
    const sortBy = allowedSortFields.includes(req.query.sortBy)
      ? req.query.sortBy
      : "createdAt"
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1
    const sort = { [sortBy]: sortOrder }

    // Execute query and count total items in parallel
    const [notes, totalItems] = await Promise.all([
      Note.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Note.countDocuments(query)
    ])

    // Calculate pagination metadata
    const totalPages = totalItems > 0 ? Math.ceil(totalItems / limit) : 0

    const pagination = {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      startIndex: totalItems > 0 ? (page - 1) * limit + 1 : 0,
      endIndex: Math.min(page * limit, totalItems)
    };

    return res.status(200).json({
      success: true,
      message: "Notes fetched successfully",
      data: notes,
      pagination
    })

  } catch (error) {
    // Log error for debugging
    console.error("Get notes error:", error)

    // Don't expose internal error details
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notes. Please try again later."
    })
  }
}

module.exports = getNotes