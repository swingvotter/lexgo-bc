const { Worker } = require("bullmq");
const redis = require("../config/redis");
const path = require("../path");
const CourseMaterial = require(path.models.lecturer.courseMaterial);
const courseCreatorGpt = require(path.utils.ai.courseCreator);

let courseMaterialWorker = null;

function createWorker() {
  if (courseMaterialWorker) return courseMaterialWorker;

  courseMaterialWorker = new Worker(
    "course-material-generation",
    async (job) => {
      const { courseId, lecturerId, combinedContent } = job.data;

      // Pass only the combined content; the helper builds the full system prompt
      const aiResponse = await courseCreatorGpt(combinedContent);

      let parsed;
      try {
        parsed = JSON.parse(aiResponse);
      } catch (err) {
        throw new Error("AI returned invalid JSON format for course material");
      }

      // Basic validation
      if (!parsed || !parsed.title || !parsed.introduction || !Array.isArray(parsed.chapters)) {
        throw new Error("AI response missing required course fields");
      }

      // Create CourseMaterial in DB
      const courseMaterial = await CourseMaterial.create({
        lecturerId,
        courseId,
        title: parsed.title,
        introduction: parsed.introduction,
        chapters: parsed.chapters,
      });

      return { courseMaterialId: courseMaterial._id.toString() };
    },
    {
      connection: redis,
      concurrency: 2,
      lockDuration: 120000, // 2 minutes, as this is the heaviest AI task
      stalledInterval: 60000,
    }
  );

  courseMaterialWorker.on("completed", (job) => {
    console.log(`Course material job ${job.id} completed`);
  });

  courseMaterialWorker.on("failed", (job, err) => {
    console.error(`Course material job ${job.id} failed:`, err.message);
  });

  courseMaterialWorker.on("error", (error) => {
    console.error("Course material worker error:", error.message);
  });

  return courseMaterialWorker;
}

module.exports = createWorker;
