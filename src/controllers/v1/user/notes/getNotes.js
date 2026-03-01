const path = require("../../../../path");
const { getNotesService } = require(path.services.v1.user.getNotes);

const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

const getNotes = async (req, res) => {

  const result = await getNotesService({
    userId: req.userInfo?.id,
    cursor: req.query?.cursor ?? null,
    limit: req.query?.limit ?? 25,
    topic: req.query?.topic ?? null,
    importanceLevel: req.query?.importanceLevel ?? null,
    search: req.query?.search ?? null
  });

  logger.info("Notes fetched", {
    userId: req.userInfo?.id,
    count: result.data.length,
    cursor: req.query?.cursor ?? null,
    limit: req.query?.limit ?? 25
  });

  return res.status(200).json({
    success: true,
    message: "Notes fetched successfully",
    data: result.data,
    nextCursor: result.nextCursor,
    hasMore: result.hasMore
  });
};

module.exports = asyncHandler(getNotes);