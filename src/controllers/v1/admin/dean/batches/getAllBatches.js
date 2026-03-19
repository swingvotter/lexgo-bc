const path = require("../../../../../path");
const Batch = require(path.models.lecturer.batch);
const User = require(path.models.users.user);
const cursorPagination = require(path.utils.cursorPagination);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

const getAllBatches = async (req, res) => {
  const limit = Number(req.query.limit || 25);
  const cursor = req.query.cursor || null;
  const deanUniversity = req.userInfo?.university;

  const order = req.query.order === "asc" ? 1 : -1;
  const sortOptions = { _id: order };

  const lecturersInUniversity = await User.find({
    role: "lecturer",
    university: deanUniversity,
  }).select("_id").lean();

  const lecturerIds = lecturersInUniversity.map((l) => l._id);

  const filter = { userId: { $in: lecturerIds } };

  if (req.query.batchYear) {
    filter.batchYear = req.query.batchYear;
  }

  if (req.query.batchName) {
    filter.batchName = req.query.batchName;
  }

  const totalBatches = await Batch.countDocuments(filter);

  const result = await cursorPagination({
    model: Batch,
    filter,
    limit,
    cursor,
    projection: {},
    sort: sortOptions,
  });

  logger.info("Dean fetched all batches", {
    deanId: req.userInfo?.id,
    university: deanUniversity,
    count: result.data.length,
    total: totalBatches,
  });

  return res.status(200).json({
    success: true,
    total: totalBatches,
    data: result.data,
    nextCursor: result.nextCursor,
    hasMore: result.hasMore,
  });
};

module.exports = asyncHandler(getAllBatches);
