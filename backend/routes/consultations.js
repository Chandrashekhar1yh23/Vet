const express = require('express');
const router = express.Router();
const Consultation = require('../models/Consultation');
const multer = require('multer');

// Simple multer setup for handling binary uploads in memory (for mocking processing)
const upload = multer({ storage: multer.memoryStorage() });

// GET all consultations for a user
router.get('/:userId', async (req, res) => {
    try {
        const history = await Consultation.find({ userId: req.params.userId }).populate('doctorId', 'name specialization');
        res.json(history);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST to create a new consultation (with optional file upload)
router.post('/', upload.array('images', 3), async (req, res) => {
    try {
        const { userId, doctorId, petName, symptoms } = req.body;
        
        // Mock image paths based on uploaded files
        let uploadedImages = [];
        if (req.files && req.files.length > 0) {
            uploadedImages = req.files.map(f => `mock_url_path_${f.originalname}`);
        }

        const consult = new Consultation({
            userId,
            doctorId: doctorId || null,
            petName,
            symptoms,
            images: uploadedImages
        });

        await consult.save();
        res.status(201).json(consult);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
