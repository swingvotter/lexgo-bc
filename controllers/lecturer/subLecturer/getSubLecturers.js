const path = require("../../../path");
const SubLecturer = require(path.models.lecturer.subLecturer);
const Course = require(path.models.lecturer.course);
const mongoose = require("mongoose");

/**
 * Get approved sub-lecturers for a course
 * 
 * @route GET /api/SubLecturer/:courseId
 * @access Private - Requires authentication (course owner only)
 */
const getSubLecturers = async (req, res) => {
    try {
        const { courseId } = req.params;
        const ownerId = req.userInfo.id;

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ success: false, message: "Invalid course ID" });
        }

        // Verify course exists and user is the owner
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        if (course.lecturerId.toString() !== ownerId) {
            return res.status(403).json({
                success: false,
                message: "Only the course owner can view sub-lecturers"
            });
        }

        // Get approved sub-lecturers
        const subLecturers = await SubLecturer.find({
            courseId,
            status: "approved",
        }).populate("lecturerId", "firstName lastName email");

        return res.status(200).json({
            success: true,
            data: subLecturers,
        });
    } catch (error) {
        console.error("Get sub-lecturers error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = getSubLecturers;
