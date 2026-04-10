const express = require('express');
const router = express.Router();
const Vaccination = require('../models/Vaccination');

// Get all vaccinations for the logged-in user
router.get('/:userId', async (req, res) => {
    try {
        const vaccinations = await Vaccination.find({ userId: req.params.userId }).sort({ dueDate: 1 });
        res.json(vaccinations);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Add Vaccination Record
router.post('/', async (req, res) => {
    try {
        const { userId, animalName, vaccineName, dueDate, status } = req.body;
        
        const newVaccination = new Vaccination({ 
            userId, 
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
router.put('/:id', async (req, res) => {
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
