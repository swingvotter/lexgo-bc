const path = require("../../../path");
const SubLecturer = require(path.models.lecturer.subLecturer);
const Course = require(path.models.lecturer.course);
const mongoose = require("mongoose");

/**
 * Get pending sub-lecturer requests for a course
 * 
 * @route GET /api/SubLecturer/requests/:courseId
 * @access Private - Requires authentication (course owner only)
 */
const getPendingSubLecturers = async (req, res) => {
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
                message: "Only the course owner can view sub-lecturer requests"
            });
        }

        // Get pending requests
        const requests = await SubLecturer.find({
            courseId,
            status: "pending",
        }).populate("lecturerId", "firstName lastName email");

        return res.status(200).json({
            success: true,
            message: "Pending sub-lecturer requests fetched successfully",
            data: requests,
        });
    } catch (error) {
        console.error("Get pending sub-lecturers error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = getPendingSubLecturers;
