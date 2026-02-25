const path = require('../../../../path');
const SubLecturer = require(path.models.lecturer.subLecturer);
const Course = require(path.models.lecturer.course);
const mongoose = require("mongoose");

/**
 * Approve or reject a sub-lecturer request
 * 
 * @route PATCH /api/SubLecturer/request/:courseId/:lecturerId
 * @access Private - Requires authentication (course owner only)
 */
const handleSubLecturerRequest = async (req, res) => {
    try {
        const { courseId, lecturerId } = req.params;
        const { action } = req.body || {};
        const ownerId = req.userInfo.id;

        if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(lecturerId)) {
            return res.status(400).json({ success: false, message: "Invalid course ID or lecturer ID" });
        }

        if (!action || !["approve", "reject"].includes(action)) {
            return res.status(400).json({
                success: false,
                message: "Invalid action. Must be 'approve' or 'reject'"
            });
        }

        // Verify course exists and user is the owner
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        if (course.lecturerId.toString() !== ownerId) {
            return res.status(403).json({
                success: false,
                message: "Only the course owner can manage sub-lecturer requests"
            });
        }

        // Find the pending request
        const request = await SubLecturer.findOne({
            courseId,
            lecturerId,
            status: "pending",
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "No pending request found for this lecturer"
            });
        }

        // Update status
        request.status = action === "approve" ? "approved" : "rejected";
        await request.save();

        return res.status(200).json({
            success: true,
            message: `Sub-lecturer request ${action === "approve" ? "approved" : "rejected"} successfully`,
            data: request,
        });
    } catch (error) {
        console.error("Handle sub-lecturer request error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = handleSubLecturerRequest;
