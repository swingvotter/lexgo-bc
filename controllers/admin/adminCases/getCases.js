const AdminCase = require("../../../models/admin/adminCase.Model");
const getPagination = require("../../../utils/pagination")

const getAllCases = async (req, res) => {
  try {

    // ---------------------------
    // 1. Pagination
    // ---------------------------
    const { page, limit, skip } = getPagination(req.query)

    // ---------------------------
    // 2. Sorting
    // ---------------------------
    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order === "asc" ? 1 : -1;

    const sortOptions = { [sortBy]: order };

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
    const [cases, total] = await Promise.all([
      AdminCase.find(filter).sort(sortOptions).skip(skip).limit(limit).lean(),

      AdminCase.countDocuments(filter),
    ]);

    // ---------------------------
    // 6. Response
    // ---------------------------
    return res.status(200).json({
      success: true,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: cases,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = getAllCases;
