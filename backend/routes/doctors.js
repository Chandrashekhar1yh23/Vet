const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');

// GET all doctors
router.get('/', async (req, res) => {
    try {
        const doctors = await Doctor.find().populate('userId', 'name email');
        res.json(doctors);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// GET profile by ID
router.get('/:id', async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id).populate('userId', 'name email');
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
        res.json(doctor);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

const multer = require('multer');
const path = require('path');

// Setup Multer Storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, 'doctor-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// POST new doctor
router.post('/', upload.single('profilePhotoFile'), async (req, res) => {
    try {
        // Extract basic fields
        const { userId, name, specialization, experience, qualification, clinicLocation, contactPhone, contactEmail, availableHours } = req.body;
        
        let profileUrl = 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=250&auto=format&fit=crop';
        if (req.file) {
            profileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        } else if (req.body.profilePhoto) {
            profileUrl = req.body.profilePhoto;
        }

        const doctor = new Doctor({
            userId,
            name,
            specialization,
            experience,
            qualification,
            clinicLocation,
            contactPhone,
            contactEmail,
            availableHours,
            profilePhoto: profileUrl
        });

        await doctor.save();
        res.status(201).json(doctor);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error adding doctor' });
    }
});

// POST book appointment
router.post('/book', async (req, res) => {
    try {
        const { userId, doctorId, appointmentDate } = req.body;
        
        // Find user & doctor
        const User = require('../models/User'); // Mongoose model for User
        const user = await User.findById(userId);
        const doctor = await Doctor.findById(doctorId);

        if (!user || !doctor) return res.status(404).json({ message: 'User or Doctor not found' });

        const { sendMockSMS, sendVerificationEmail } = require('../utils/notifier'); // We'll rename this generic sender next
        const nodemailer = require('nodemailer');
        
        // Send Email Confirmation
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });
        
        if (process.env.EMAIL_USER) {
            await transporter.sendMail({
                from: '"VetSense AI Appointments" <appointments@vetsense.ai>',
                to: user.email,
                subject: `Appointment Confirmed: ${doctor.name}`,
                text: `Your appointment with ${doctor.name} is confirmed for ${appointmentDate}.`,
                html: `<h3>Booking Confirmation</h3><p>Your appointment with <strong>${doctor.name}</strong> is confirmed for <strong>${appointmentDate}</strong>.</p>`
            });
        }

        // Send SMS Confirmation
        const smsMessage = `VetSense AI: Your appointment with ${doctor.name} is confirmed for ${appointmentDate}.`;
        sendMockSMS(user.phone || "+919876543210", smsMessage);

        res.json({ message: 'Appointment booked successfully. Notifications sent.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error booking appointment' });
    }
});

// DELETE doctor profile
router.delete('/:id', async (req, res) => {
    try {
        const deletedDoctor = await Doctor.findByIdAndDelete(req.params.id);
        if (!deletedDoctor) return res.status(404).json({ message: 'Doctor not found' });
        
        // Also fire off a console response
        console.log(`Deleted Doctor Profile: ${deletedDoctor.name}`);
        res.json({ message: 'Doctor profile removed successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error deleting doctor' });
    }
});

module.exports = router;
