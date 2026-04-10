const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
    animalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    diagnosis: { type: String, required: true },
    prescription: { type: String, required: true },
    notes: { type: String }
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
