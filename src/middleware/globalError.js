const path = require('../path');
const logger = require(path.config.logger);

const globalErrorHandler = (err, req, res, next) => {
    logger.error("Unhandled error", { error: err.message, stack: err.stack, url: req.originalUrl, method: req.method, email: req.body?.email });
    const message = err.message || "An unexpected error occurred";
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ success: false, message });
}

module.exports = globalErrorHandler;