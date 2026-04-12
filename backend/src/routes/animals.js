const express = require('express');
const router = express.Router();
const Animal = require('../models/Animal');
const auth = require('../middlewares/authMiddleware');
const logAction = require('../utils/auditLogger');

// Get all animals for the organization
router.get('/', auth, async (req, res) => {
    try {
        const animals = await Animal.find({ organizationId: req.user.organizationId });
        res.json(animals);
    } catch (err) {
        next(err);
    }
});

// Add new animal
router.post('/', auth, async (req, res) => {
    try {
        const { name, species, breed, age, isFarmAnimal, milkProduction } = req.body;
        const newAnimal = new Animal({
            name, species, breed, age,
            ownerId: req.user.userId,
            organizationId: req.user.organizationId,
            isFarmAnimal: isFarmAnimal || false,
            milkProduction: milkProduction || 0
        });
        const saved = await newAnimal.save();
        
        logAction(req.user.userId, req.user.organizationId, 'CREATE', 'ANIMAL', saved._id);
        
        res.json(saved);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
