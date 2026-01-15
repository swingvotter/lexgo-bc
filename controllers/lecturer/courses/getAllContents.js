const ResourceContent = require("../../../models/lecturer/resourceContent");

/**
 * Get all resource contents for a course (concatenated)
 * 
 * @route GET /api/Courses/resourceContents/:courseId
 * @access Private - Requires authentication
 * 
 * @description Fetches all extracted PDF text content for a course
 * and returns them concatenated into a single string. Useful for
 * AI processing or displaying combined course content.
 * 
 * @param {string} req.params.courseId - The course ID
 * @returns {Object} Combined content string and count of resources
 */
const getAllResourceContentHandler = async (req, res) => {
  try {
    // Accept courseId from query, params, or body for flexibility
    const courseId = req.query?.courseId || req.params?.courseId || req.body?.courseId;
    if (!courseId) {
      return res.status(400).json({ success: false, message: "courseId is required" });
    }

    // Fetch only the content field (exclude _id for cleaner response)
    const resourceContents = await ResourceContent.find({ courseId }).select("content -_id");

    // Concatenate all content with delimiters between PDFs
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

