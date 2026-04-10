const express = require('express');
const router = express.Router();

// Mock Vet Locator
router.get('/nearest', (req, res) => {
    const { lat, lng } = req.query;

    const mockClinics = [
        { id: 1, name: "Animal Care Hospital", address: "123 Main St", distance: "1.2 km", lat: 34.0522, lng: -118.2437 },
        { id: 2, name: "Pet Health Clinic", address: "456 Oak Lane", distance: "2.5 km", lat: 34.0622, lng: -118.2537 },
        { id: 3, name: "Livestock & Vet Care", address: "789 Farm Rd", distance: "5.0 km", lat: 34.0822, lng: -118.2837 },
    ];

    setTimeout(() => {
        res.json(mockClinics);
    }, 800); // Simulate physical distance query
});

module.exports = router;
