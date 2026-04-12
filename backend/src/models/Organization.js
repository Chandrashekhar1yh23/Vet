const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../security/encryption');

const OrganizationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { 
        type: String, 
        required: true,
        set: encrypt,
        get: decrypt 
    },
    address: { type: String },
    plan: {
        type: String,
        enum: ['FREE', 'PRO', 'ENTERPRISE'],
        default: 'FREE'
    },
    createdAt: { type: Date, default: Date.now }
}, {
    toJSON: { getters: true },
    toObject: { getters: true }
});

module.exports = mongoose.model('Organization', OrganizationSchema);
