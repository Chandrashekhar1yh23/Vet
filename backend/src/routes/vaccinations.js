const express = require('express');
const router = express.Router();
const Vaccination = require('../models/Vaccination');

const auth = require('../middlewares/authMiddleware');

// Get all vaccinations for the organization
router.get('/', auth, async (req, res) => {
    try {
        const vaccinations = await Vaccination.find({ organizationId: req.user.organizationId }).sort({ dueDate: 1 });
        res.json(vaccinations);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Add Vaccination Record
router.post('/', auth, async (req, res) => {
    try {
        const { animalName, vaccineName, dueDate, status } = req.body;
        
        const newVaccination = new Vaccination({ 
            userId: req.user.userId, 
            organizationId: req.user.organizationId,
            animalName, 
            vaccineName, 
            dueDate,
            status: status || 'Pending'
        });
        
        const saved = await newVaccination.save();
        res.status(201).json(saved);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error adding vaccination' });
    }
});

// Mark Vaccination as Completed
router.put('/:id', auth, async (req, res) => {
    try {
        const record = await Vaccination.findByIdAndUpdate(
            req.params.id, 
            { status: 'Completed', dateAdministered: new Date() },
            { new: true }
        );
        res.json(record);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error updating vaccination' });
    }
});

module.exports = router;
