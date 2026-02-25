const path = require('../../../../path');
const SubLecturer = require(path.models.lecturer.subLecturer);
const Course = require(path.models.lecturer.course);
const mongoose = require("mongoose");

/**
 * Remove a sub-lecturer from a course
 * 
 * @route DELETE /api/SubLecturer/:courseId/:lecturerId
 * @access Private - Requires authentication (course owner only)
 */
const removeSubLecturer = async (req, res) => {
    try {
        const { courseId, lecturerId } = req.params;
        const ownerId = req.userInfo.id;

        if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(lecturerId)) {
            return res.status(400).json({ success: false, message: "Invalid course ID or lecturer ID" });
        }

        // Verify course exists and user is the owner
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        if (course.lecturerId.toString() !== ownerId) {
            return res.status(403).json({
                success: false,
                message: "Only the course owner can remove sub-lecturers"
            });
        }

        // Remove sub-lecturer record
        const result = await SubLecturer.findOneAndDelete({
            courseId,
            lecturerId,
        });

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Sub-lecturer not found for this course"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Sub-lecturer removed successfully",
        });
    } catch (error) {
        console.error("Remove sub-lecturer error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = removeSubLecturer;
