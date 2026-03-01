const cursorPagination = async ({
  model,
  filter = {},      // FINAL filter comes from controller
  projection = {},
  limit = 25,
  explain = false,
  cursor = null,
  sort = { _id: -1 }
}) => {

  // 1) Copy filter
  let finalFilter = { ...filter };

  // 2) Add cursor rule
  if (cursor) {
    finalFilter._id = { $lt: cursor };
  }

  // 👇 If explain mode is on, return explain instead of data
  if (explain) {
    return await model.find(finalFilter, projection).sort(sort).explain("executionStats");
  }

  // 3) Fetch data
  const results = await model
    .find(finalFilter, projection)
    .sort(sort)
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;

  // 4) Get next cursor
  const nextCursor = data.length > 0
    ? data[data.length - 1]._id
    : null;

  // 5) Return result
  return {
    data,
    nextCursor,
    hasMore
  };
};

module.exports = cursorPagination;