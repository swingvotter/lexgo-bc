const CourseMaterial = require("../../models/lecturer/courseMaterial");

const getCourseMaterialsHandler = async (req, res) => {
  try {
    const courseId = req.params?.courseId;
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "courseId is required",
      });
    }

    const materials = await CourseMaterial.find({ courseId }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: materials });
  } catch (error) {
    console.error("Get course materials error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = getCourseMaterialsHandler;
