const Resource = require("../../models/lecturer/resource");
const Course = require("../../models/lecturer/courses.Model");
const mongoose = require("mongoose");

const getCourseResourcesHandler = async (req, res) => {
  try {
    const courseId = req.params?.courseId;
    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: "valid courseId is required" });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 20);
    const sort = req.query.sort || "-createdAt";
    const select = req.query.fields ? req.query.fields.split(",").join(" ") : "-__v";

    const course = await Course.findById(courseId).select("_id");
    if (!course) {
      return res.status(404).json({ success: false, message: "course not found" });
    }

    const filter = { courseId };
    const total = await Resource.countDocuments(filter);
    const resources = await Resource.find(filter)
      .select(select)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
      data: resources,
    });
  } catch (error) {
    console.error("Get course resources error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = getCourseResourcesHandler;
