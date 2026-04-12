const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../security/encryption');

const medicalRecordSchema = new mongoose.Schema({
    animalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    diagnosis: { 
        type: String, 
        required: true,
        set: encrypt,
        get: decrypt 
    },
    prescription: { type: String, required: true },
    notes: { type: String }
}, {
    toJSON: { getters: true },
    toObject: { getters: true }
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
