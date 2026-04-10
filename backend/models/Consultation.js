const mongoose = require('mongoose');

const ConsultationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    petName: { type: String, required: true },
    date: { type: Date, default: Date.now },
    symptoms: { type: String, required: true },
    diagnosis: { type: String, default: 'Pending Review' },
    prescription: { type: String, default: 'None yet' },
    followUp: { type: String },
    images: [{ type: String }] // Array of image URLs/paths
});

module.exports = mongoose.model('Consultation', ConsultationSchema);
