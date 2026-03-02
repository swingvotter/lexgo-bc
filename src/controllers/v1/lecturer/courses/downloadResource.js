const path = require('../../../../path');
const Resource = require(path.models.lecturer.resource);
const axios = require("axios");
const cloudinaryUrlSigner = require(path.utils.cloudinaryUrlSigner);
const AppError = require(path.error.appError);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

/**
 * Proxy PDF resource from Cloudinary to the client
 * 
 * @route GET /api/Courses/resource/download/:resourceId
 * @access Private - Requires authentication
 * 
 * @description Fetches a private resource from Cloudinary, sets proper PDF 
 * headers (Content-Type, Content-Disposition), and streams it to the client.
 * This allows for browser preview, proper filenames, and backend-controlled access.
 * 
 * @param {string} req.params.resourceId - The ID of the resource to download
 */
const downloadResourceHandler = async (req, res) => {
    const { resourceId } = req.params;

    const resource = await Resource.findById(resourceId);
    if (!resource) {
        logger.warn("Resource missing", { resourceId });
        throw new AppError("Resource not found", 404);
    }

    const signedUrl = cloudinaryUrlSigner(resource.publicId);

    const response = await axios({
        method: 'get',
        url: signedUrl,
        responseType: 'stream'
    });

    const contentType = resource.fileExtension || 'application/octet-stream';
    const fileName = resource.fileName || `resource-${resourceId}`;
    const isPdf = contentType === 'application/pdf';

    res.setHeader('Content-Type', contentType);
    res.setHeader(
        'Content-Disposition',
        `${isPdf ? 'inline' : 'attachment'}; filename="${fileName}"`
    );

    if (response.headers['content-length']) {
        res.setHeader('Content-Length', response.headers['content-length']);
    }

    logger.info("Resource download", { resourceId });
    response.data.pipe(res);
};

module.exports = asyncHandler(downloadResourceHandler);
