const path = require("../../../path");
const SubLecturer = require(path.models.lecturer.subLecturer);
const Course = require(path.models.lecturer.course);
const mongoose = require("mongoose");
const getPagination = require(path.utils.pagination);

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

        const { page, limit, skip } = getPagination(req.query);
        const filter = {
            courseId,
            status: "approved",
        };

        // Get approved sub-lecturers with pagination
        const [subLecturers, total] = await Promise.all([
            SubLecturer.find(filter)
                .populate("lecturerId", "firstName lastName email")
                .skip(skip)
                .limit(limit)
                .lean(),
            SubLecturer.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            data: subLecturers,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Get sub-lecturers error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = getSubLecturers;
