const path = require('../../../../path');
const LecturerCase = require(path.models.lecturer.case);
const axios = require("axios");
const cloudinaryUrlSigner = require(path.utils.cloudinaryUrlSigner);
const Enrollment = require(path.models.users.enrollment);

/**
 * Proxy Case PDF document from Cloudinary to the client for streaming/viewing.
 * Validates enrollment access.
 */
const viewCaseDocumentHandler = async (req, res) => {
    try {
        const { caseId } = req.params;
        const userId = req.userInfo.id;

        // 1. Fetch Case
        const foundCase = await LecturerCase.findById(caseId);
        if (!foundCase) {
            return res.status(404).json({ success: false, message: "Case not found" });
        }

        // 2. Security Check: Check Enrollment
        const enrollment = await Enrollment.findOne({
            userId,
            course: foundCase.courseId,
            status: "approved",
        });

        if (!enrollment) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: You are not enrolled and approved for this course",
            });
        }

        if (!foundCase.caseDocumentPublicId) {
            return res.status(404).json({ success: false, message: "No document attached to this case" });
        }

        // 3. Generate Signed URL and Proxy the stream
        const signedUrl = cloudinaryUrlSigner(foundCase.caseDocumentPublicId);

        const response = await axios({
            method: 'get',
            url: signedUrl,
            responseType: 'stream'
        });

        const contentType = foundCase.documentMimeType || 'application/octet-stream';
        const fileName = foundCase.documentFileName || `${foundCase.title.replace(/\s+/g, '_')}.pdf`;
        const isPdf = contentType === 'application/pdf';

        // Set Headers for Viewing/Downloading
        res.setHeader('Content-Type', contentType);
        res.setHeader(
            'Content-Disposition',
            `${isPdf ? 'inline' : 'attachment'}; filename="${fileName}"`
        );

        if (response.headers['content-length']) {
            res.setHeader('Content-Length', response.headers['content-length']);
        }

        response.data.pipe(res);

    } catch (error) {
        console.error("View Case Document Error:", error);

        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: "Error fetching document"
            });
        }
    }
};

module.exports = viewCaseDocumentHandler;
