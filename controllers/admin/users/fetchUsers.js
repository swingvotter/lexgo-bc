// controllers/admin/fetchUsers.js
const User = require("../../../models/users/user.Model")
const getPagination = require("../../../utils/pagination")

const adminFindUsersHandler = async (req, res) => {
  try {
    // Get pagination parameters
    const { page, limit, skip } = getPagination(req.query)

    // Build query with optional filters
    const query = {};

    // Role filter (validate against allowed roles)
    if (req.query.role) {
      const allowedRoles = ["student", "lecturer", "admin"];
      if (allowedRoles.includes(req.query.role)) {
        query.role = req.query.role;
      }
    }

    // Search filter (email, firstName, lastName)
    if (req.query.search && typeof req.query.search === "string") {
      const searchTerm = req.query.search.trim();
      if (searchTerm.length > 0) {
        const searchRegex = { $regex: searchTerm, $options: "i" };
        query.$or = [
          { email: searchRegex },
          { firstName: searchRegex },
          { lastName: searchRegex }
        ];
      }
    }

    // Sort validation (prevent NoSQL injection)
    const allowedSortFields = ["createdAt", "email", "firstName", "lastName", "role"];
    const sortBy = allowedSortFields.includes(req.query.sortBy)
      ? req.query.sortBy
      : "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    // Execute queries in parallel
    const [users, totalItems, totalStudents] = await Promise.all([
      User.find(query)
        .select("-password -refreshToken -passwordReset")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
      User.countDocuments({ role: "student" })
    ])

    // Calculate pagination metadata
    const totalPages = totalItems > 0 ? Math.ceil(totalItems / limit) : 0;

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
      totalStudents,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        // Additional helpful fields
        startIndex: totalItems > 0 ? (page - 1) * limit + 1 : 0,
        endIndex: Math.min(page * limit, totalItems)
      }
    })

  } catch (error) {
    // Log error for debugging (use proper logger in production)
    console.error("Fetch users error:", error);

    // Don't expose internal error details
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users. Please try again later."
    });
  }
}

module.exports = adminFindUsersHandler