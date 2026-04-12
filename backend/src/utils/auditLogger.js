const AuditLog = require('../models/AuditLog');
const logger = require('./logger');

/**
 * Creates an Audit Log record without blocking the API thread.
 * Any errors saving the log are caught and pushed to Winston instead of crashing the process.
 */
const logAction = (userId, organizationId, action, resourceType, resourceId = null, metadata = {}) => {
    // Fire and forget (don't await)
    setImmediate(async () => {
        try {
            if (!organizationId) {
                logger.warn('AuditLog omitted: missing organizationId', { action, resourceType });
                return;
            }

            const rawLog = new AuditLog({
                userId,
                organizationId,
                action,
                resourceType,
                resourceId,
                metadata
            });
            await rawLog.save();
        } catch (err) {
            logger.error('Failed to write AuditLog to Database', { error: err.message, action, resourceId });
        }
    });
};

module.exports = logAction;
