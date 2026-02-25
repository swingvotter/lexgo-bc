const path = require('../../../../path');
const Resource = require(path.models.lecturer.resource);
const axios = require("axios");
const cloudinaryUrlSigner = require(path.utils.cloudinaryUrlSigner);

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
    try {
        const { resourceId } = req.params;

        const resource = await Resource.findById(resourceId);
        if (!resource) {
            return res.status(404).json({ success: false, message: "Resource not found" });
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

        response.data.pipe(res);

    } catch (error) {
        console.error("Download resource error:", error);

        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: "Error fetching resource"
            });
        }
    }
};


module.exports = downloadResourceHandler;
