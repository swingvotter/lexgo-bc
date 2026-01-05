const LecturerCase = require("../../../models/lecturer/cases");

const deleteCase = async (req, res) => {
    try {
        const { id } = req.params;
        const lecturerId = req.userInfo.id;

        if (!id) {
            return res.status(400).json({ success: false, message: "Case ID is required" });
        }

        // Ensure the case belongs to the lecturer
        const deletedCase = await LecturerCase.findOneAndDelete({ _id: id, lecturerId });

        if (!deletedCase) {
            return res.status(404).json({ success: false, message: "Case not found or unauthorized" });
        }

        return res.status(200).json({ success: true, message: "Case deleted successfully" });

    } catch (error) {
        console.error("Delete case error:", error);
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

module.exports = deleteCase;
