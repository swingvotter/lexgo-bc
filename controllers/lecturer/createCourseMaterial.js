const ResourceContent = require("../../models/lecturer/resourceContent");

const createCourseMaterialHandler = async (req, res) => {
  try {
    const courseId =  req.params?.courseId 
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "courseId is required",
      });
    }

    const resourceContents = await ResourceContent.find({ courseId }).select(
      "content -_id"
    ); // only get 'content' for the course
 
    const allContentCombined = resourceContents
      .map((item) => item.content)
      .join("-----------new pdf-----------");

    // Add job to queue for background processing

    return res.status(202).json({
      success: true,
      message: "job created successfully",
    });
  } catch (error) {
    console.error("Get resource content error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = createCourseMaterialHandler;
