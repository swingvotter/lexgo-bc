const SubLecturer = require("../../../models/lecturer/subLecturer");
const Course = require("../../../models/lecturer/courses.Model");
const User = require("../../../models/users/user.Model");
const mongoose = require("mongoose");

/**
 * Request to become a sub-lecturer for a course
 * 
 * @route POST /api/SubLecturer/request/:courseId
 * @access Private - Requires authentication (lecturer only)
 */
const requestSubLecturer = async (req, res) => {
    try {
        const { courseId } = req.params;
        const lecturerId = req.userInfo.id;

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ success: false, message: "Invalid course ID" });
        }

        // Verify course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        // Cannot request for own course
        if (course.lecturerId.toString() === lecturerId) {
            return res.status(400).json({
                success: false,
                message: "You are the owner of this course"
            });
        }

        // Check if request already exists
        const existing = await SubLecturer.findOne({ courseId, lecturerId });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: `You already have a ${existing.status} request for this course`
            });
        }

        // Create pending request
        const request = await SubLecturer.create({
            courseId,
            lecturerId,
            status: "pending",
        });

        return res.status(201).json({
            success: true,
            message: "Sub-lecturer request submitted successfully",
            data: request,
        });
    } catch (error) {
        console.error("Request sub-lecturer error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = requestSubLecturer;
