const cloudinary = require("../config/cloudinary");

/**
 * Generates a signed URL for a private PDF resource on Cloudinary
 * @param {string} publicId - The public ID of the resource
 * @returns {string} - The signed URL
 */
const generateSignedUrl = (publicId) => {
    if (!publicId) return null;

    return cloudinary.url(publicId, {
        resource_type: "raw",  // PDF is a raw file type
        type: "private",       // Private upload requires signed URLs
        sign_url: true,
        expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
    });
};

module.exports = generateSignedUrl;
