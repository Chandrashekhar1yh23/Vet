const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    logger.error('Error caught by Centralized Handler: %O', { message: err.message, stack: err.stack, origin: req.ip });

    // Handle mongoose validation errors cleanly
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            details: messages
        });
    }

    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ success: false, message: 'Invalid credentials or token' });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({ success: false, message: 'Invalid resource ID' });
    }

    // Generic safe fallback (concealing stack traces from users)
    const status = err.statusCode || 500;
    res.status(status).json({
        success: false,
        message: err.isOperational ? err.message : 'Internal Server Error. Please try again later.'
    });
};

module.exports = errorHandler;
