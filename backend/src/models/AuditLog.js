const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    action: { type: String, required: true }, // LOGIN, CREATE_ANIMAL, UPDATE_APPOINTMENT, etc.
    resourceType: { type: String, required: true }, // USER, ANIMAL, APPOINTMENT, ORGANIZATION, etc.
    resourceId: { type: mongoose.Schema.Types.ObjectId },
    metadata: { type: mongoose.Schema.Types.Mixed }, // Safe non-sensitive JSON payload details
    createdAt: { 
        type: Date, 
        default: Date.now,
        expires: 60 * 60 * 24 * 90 // TTL 90 days
    }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
