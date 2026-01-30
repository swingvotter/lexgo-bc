// utils/pagination.js
const getPagination = (query) => {
  // Parse and validate page
  let page = parseInt(query.page);
  if (isNaN(page) || page < 1) {
    page = 1;
  }
  
  // Parse and validate limit
  let limit = parseInt(query.limit);
  if (isNaN(limit) || limit < 1) {
    limit = 10; // Default
  } else if (limit > 50) {
    limit = 50; // Max limit
  }
  
  // Calculate skip
  const skip = (page - 1) * limit;
  
  // Prevent integer overflow (safety check)
  if (skip < 0 || skip > Number.MAX_SAFE_INTEGER) {
    throw new Error("Invalid pagination parameters");
  }
  
  return { page, limit, skip };
}

module.exports = getPagination