const path = require("../../../../path");
const Batch = require(path.models.lecturer.batch);
const cursorPagination = require(path.utils.cursorPagination);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

const getBatches = async (req, res) => {
  const limit = Number(req.query.limit || 25);
  const cursor = req.query.cursor || null;
  const lecturerId = req.userInfo?.id;

  const order = req.query.order === "asc" ? 1 : -1;
  const sortOptions = { _id: order };

  const filter = { userId: lecturerId };

  if (req.query.batchYear) {
    filter.batchYear = req.query.batchYear;
  }

  if (req.query.batchName) {
    filter.batchName = req.query.batchName;
  }

  const result = await cursorPagination({
    model: Batch,
    filter,
    limit,
    cursor,
    projection: {},
    sort: sortOptions,
  });

  logger.info("Batches fetched", { lecturerId, count: result.data.length, limit, cursor });
  
  return res.status(200).json({
    success: true,
    data: result.data,
    nextCursor: result.nextCursor,
    hasMore: result.hasMore,
  });
};

module.exports = asyncHandler(getBatches);
