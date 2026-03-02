const path = require('../../../../path');
const AdminCase = require(path.models.admin.case);
const cursorPagination = require(path.utils.cursorPagination);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

const getAllCases = async (req, res) => {
  const limit = Number(req.query.limit || 25);
  const cursor = req.query.cursor || null;

  // ---------------------------
  // 2. Sorting
  // ---------------------------
  const order = req.query.order === "asc" ? 1 : -1;
  const sortOptions = { _id: order };

  // ---------------------------
  // 3. Filters
  // ---------------------------
  const filter = {};

  // Exact filters
  if (req.query.title) {
    filter.title = req.query.title;
  }

  if (req.query.citation) {
    filter.citation = req.query.citation;
  }

  if (req.query.jurisdiction) {
    filter.jurisdiction = req.query.jurisdiction;
  }

  if (req.query.courtLevel) {
    filter["court.level"] = req.query.courtLevel;
  }

  if (req.query.courtName) {
    filter["court.name"] = req.query.courtName;
  }

  // ---------------------------
  // 4. Search
  // ---------------------------
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, "i");

    filter.$or = [
      { title: searchRegex },
      { citation: searchRegex },
      { summary: searchRegex },
      { ratioDecidendi: searchRegex },
      { keywords: searchRegex },
    ];
  }

  // ---------------------------
  // 5. Query database
  // ---------------------------
  const result = await cursorPagination({
    model: AdminCase,
    filter,
    limit,
    cursor,
    projection: {},
    sort: sortOptions,
  });

  // ---------------------------
  // 6. Response
  // ---------------------------
  logger.info("Admin cases fetched", { count: result.data.length, limit, cursor });
  return res.status(200).json({
    success: true,
    data: result.data,
    nextCursor: result.nextCursor,
    hasMore: result.hasMore,
  });
};

module.exports = asyncHandler(getAllCases);
