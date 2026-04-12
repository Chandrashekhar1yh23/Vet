const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const auth = require('../middlewares/authMiddleware');

// GET all appointments for the current organization
router.get('/', auth, async (req, res) => {
    try {
        const appointments = await Appointment.find({ organizationId: req.user.organizationId })
            .populate('animalId', 'name species')
            .populate('clinicId', 'name address')
            .sort({ date: -1 });
        res.json(appointments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// GET a single appointment by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const appointment = await Appointment.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId
        })
            .populate('animalId', 'name species')
            .populate('clinicId', 'name address');

        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
        res.json(appointment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST create a new appointment
router.post('/', auth, async (req, res) => {
    try {
        const { clinicId, animalId, date, reason } = req.body;

        const appointment = new Appointment({
            userId: req.user.userId,
            organizationId: req.user.organizationId,
            clinicId,
            animalId,
            date,
            reason,
            status: 'Scheduled'
        });

        await appointment.save();
        res.status(201).json(appointment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// PUT update an appointment (e.g. reschedule or change status)
router.put('/:id', auth, async (req, res) => {
    try {
        const { date, status, reason, clinicId } = req.body;

        const appointment = await Appointment.findOneAndUpdate(
            { _id: req.params.id, organizationId: req.user.organizationId },
            { date, status, reason, clinicId },
            { new: true, runValidators: true }
        );

        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
        res.json(appointment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// DELETE an appointment
router.delete('/:id', auth, async (req, res) => {
    try {
        const appointment = await Appointment.findOneAndDelete({
            _id: req.params.id,
            organizationId: req.user.organizationId
        });

        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
        res.json({ message: 'Appointment deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
