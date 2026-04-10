const mongoose = require('mongoose');

const VaccinationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    animalName: { type: String, required: true },
    vaccineName: { type: String, required: true },
    dueDate: { type: Date, required: true },
    status: { 
        type: String, 
        enum: ['Pending', 'Completed', 'Missed'],
        default: 'Pending'
    },
    dateAdministered: { type: Date }
});

module.exports = mongoose.model('Vaccination', VaccinationSchema);
