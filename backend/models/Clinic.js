const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
});

module.exports = mongoose.model('Clinic', clinicSchema);
