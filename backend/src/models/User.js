const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    role: {
        type: String,
        enum: ['ADMIN', 'VET', 'STAFF', 'Owner'], // Keeping Owner temporarily for local seeded data to avoid crashing
        default: 'ADMIN',
    },
    login_type: {
        type: String,
        enum: ['email', 'google'],
        default: 'email'
    },
    verified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String
    },
    otpCode: {
        type: String
    },
    otpExpires: {
        type: Date
    },
    otpAttempts: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('User', userSchema);
