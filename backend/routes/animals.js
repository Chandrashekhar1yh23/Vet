const express = require('express');
const router = express.Router();
const Animal = require('../models/Animal');
const auth = require('../middleware/authMiddleware');

// Get all animals for user
router.get('/', auth, async (req, res) => {
    try {
        const animals = await Animal.find({ ownerId: req.user.userId });
        res.json(animals);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Add new animal
router.post('/', auth, async (req, res) => {
    try {
        const { name, species, breed, age, isFarmAnimal, milkProduction } = req.body;
        const newAnimal = new Animal({
            name, species, breed, age,
            ownerId: req.user.userId,
            isFarmAnimal: isFarmAnimal || false,
            milkProduction: milkProduction || 0
        });
        const saved = await newAnimal.save();
        res.json(saved);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
