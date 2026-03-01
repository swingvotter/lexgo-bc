const path = require('../../../../path');
const LecturerCase = require(path.models.lecturer.case);
const axios = require("axios");
const cloudinaryUrlSigner = require(path.utils.cloudinaryUrlSigner);
const Enrollment = require(path.models.users.enrollment);
const AppError = require(path.error.appError);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

/**
 * Proxy Case PDF document from Cloudinary to the client for streaming/viewing.
 * Validates enrollment access.
 */
const viewCaseDocumentHandler = async (req, res) => {
    const { caseId } = req.params;
    const userId = req.userInfo.id;

    // 1. Fetch Case
    const foundCase = await LecturerCase.findById(caseId);
    if (!foundCase) {
        logger.warn("Case not found", { caseId, userId });
        throw new AppError("Case not found", 404);
    }

    // 2. Security Check: Check Enrollment
    const enrollment = await Enrollment.findOne({
        userId,
        course: foundCase.courseId,
        status: "approved",
    });

    if (!enrollment) {
        logger.warn("Case doc denied", { caseId, userId });
        throw new AppError("Unauthorized: You are not enrolled and approved for this course", 403);
    }

    if (!foundCase.caseDocumentPublicId) {
        logger.warn("Case doc missing", { caseId, userId });
        throw new AppError("No document attached to this case", 404);
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
    logger.info("Case doc streamed", { caseId, userId });
};

module.exports = asyncHandler(viewCaseDocumentHandler);
