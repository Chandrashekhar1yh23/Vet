const express = require('express');
const router = express.Router();
const Consultation = require('../models/Consultation');
const multer = require('multer');

const auth = require('../middlewares/authMiddleware');

// Simple multer setup for handling binary uploads in memory (for mocking processing)
const upload = multer({ storage: multer.memoryStorage() });

// GET all consultations for an organization
router.get('/', auth, async (req, res) => {
    try {
        const history = await Consultation.find({ organizationId: req.user.organizationId }).populate('doctorId', 'name specialization');
        res.json(history);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST to create a new consultation (with optional file upload)
router.post('/', auth, upload.array('images', 3), async (req, res) => {
    try {
        const { doctorId, petName, symptoms } = req.body;
        
        // Mock image paths based on uploaded files
        let uploadedImages = [];
        if (req.files && req.files.length > 0) {
            uploadedImages = req.files.map(f => `mock_url_path_${f.originalname}`);
        }

        const consult = new Consultation({
            userId: req.user.userId,
            organizationId: req.user.organizationId,
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
