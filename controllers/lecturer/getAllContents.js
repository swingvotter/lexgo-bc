const ResourceContent = require("../../models/lecturer/resourceContent");

const getAllResourceContentHandler = async (req, res) => {
  try {
    const courseId = req.query?.courseId || req.params?.courseId || req.body?.courseId;
    if (!courseId) {
      return res.status(400).json({ success: false, message: "courseId is required" });
    }

    // Fetch resource contents for the specified course
    const resourceContents = await ResourceContent.find({ courseId }).select("content -_id"); // only get 'content' for the course

    // Concatenate all content into a single string
    // resourceContents is an array of objects like [{ content: "content1" }, { content: "content2" }, ...]
    const allContentCombined = resourceContents.map((item) => item.content).join("-----------new pdf-----------");

    return res.status(200).json({
      success: true,
      message: "Resource contents fetched and concatenated successfully",
      total: resourceContents.length,
      data: allContentCombined,
    });

  } catch (error) {
    console.error("Get resource content error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = getAllResourceContentHandler;
