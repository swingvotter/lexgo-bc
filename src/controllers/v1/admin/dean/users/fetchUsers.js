const path = require('../../../../../path');
const User = require(path.models.users.user)
const cursorPagination = require(path.utils.cursorPagination)
const asyncHandler = require(path.utils.asyncHandler)
const logger = require(path.config.logger)

const adminFindUsersHandler = async (req, res) => {
  const limit = Number(req.query.limit || 25)
  const cursor = req.query.cursor || null

  // Build query with optional filters
  const query = {};

  // Role filter (validate against allowed roles)
  if (req.query.role) {
    const allowedRoles = ["student", "lecturer", "admin"];
    if (allowedRoles.includes(req.query.role)) {
      query.role = req.query.role;
    }
  }

  // Search filter (email, firstName, lastName) using $text index
  if (req.query.search && typeof req.query.search === "string") {
    const searchTerm = req.query.search.trim();
    if (searchTerm.length > 0) {
      query.$text = { $search: searchTerm };
    }
  }

  const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
  const sort = { _id: sortOrder };

  // Execute queries in parallel
  const [result, totalItems, totalStudents] = await Promise.all([
    cursorPagination({
      model: User,
      filter: query,
      limit,
      cursor,
      projection: { password: 0, refreshToken: 0, passwordReset: 0 },
      sort,
    }),
    User.countDocuments(query),
    User.countDocuments({ role: "student" })
  ])

  logger.info("Users fetched", { count: result.data.length, limit, cursor });
  return res.status(200).json({
    success: true,
    message: "Users fetched successfully",
    data: result.data,
    totalStudents,
    totalItems,
    nextCursor: result.nextCursor,
    hasMore: result.hasMore,
  })
}

module.exports = asyncHandler(adminFindUsersHandler)