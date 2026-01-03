const ResourceContent = require("../../models/lecturer/resourceContent");
const Course = require("../../models/lecturer/courses.Model");
const courseMaterialQueue = require("../../queues/courseMaterialQueue");

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

    let lecturerId = req.userInfo?.id;
    if (!lecturerId) {
      // fallback: use course owner as lecturerId if request not authenticated
      const course = await Course.findById(courseId).select("lecturerId");
      if (!course) {
        return res.status(404).json({ success: false, message: "course not found" });
      }
      lecturerId = course.lecturerId;
    }

    // Add job to queue for background processing
    const job = await courseMaterialQueue.add(
      "create-course-material",
      { courseId, lecturerId, combinedContent: allContentCombined },
      { attempts: 3, backoff: { type: "exponential", delay: 2000 } }
    );

    return res.status(202).json({
      success: true,
      message: "job created successfully",
      jobId: job.id,
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
