const Note = require("../../models/noteModel")
const getPagination = require("../../utils/pagination")

// Escape special regex characters to prevent ReDoS attacks
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const getNotes = async (req, res) => {
  try {
    const userId = req.userInfo?.id

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

    // Optional filters
    if (req.query.legalTopic) {
      query.legalTopic = req.query.legalTopic
    }

    if (req.query.importanceLevel) {
      const allowedLevels = ["Low Priority", "Medium Priority", "High Priority"]
      if (allowedLevels.includes(req.query.importanceLevel)) {
        query.importanceLevel = req.query.importanceLevel
      }
    }

    // Search filter (title and content) - with ReDoS protection
    if (req.query.search && typeof req.query.search === "string") {
      const searchTerm = req.query.search.trim()
      if (searchTerm.length > 0 && searchTerm.length <= 100) {
        const safeSearchTerm = escapeRegex(searchTerm)
        const searchRegex = { $regex: safeSearchTerm, $options: "i" }
        query.$or = [
          { title: searchRegex },
          { content: searchRegex },
          { legalTopic: searchRegex }
        ]
      }
    }

    // Sort validation (prevent NoSQL injection)
    const allowedSortFields = ["createdAt", "updatedAt", "title", "importanceLevel", "legalTopic"]
    const sortBy = allowedSortFields.includes(req.query.sortBy)
      ? req.query.sortBy
      : "createdAt"
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1
    const sort = { [sortBy]: sortOrder }

    // Execute queries in parallel
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

    return res.status(200).json({
      success: true,
      message: "Notes fetched successfully",
      data: notes,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        startIndex: totalItems > 0 ? (page - 1) * limit + 1 : 0,
        endIndex: Math.min(page * limit, totalItems)
      }
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
