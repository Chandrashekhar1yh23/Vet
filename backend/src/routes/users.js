const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');
const bcrypt = require('bcryptjs');
const logAction = require('../utils/auditLogger');

// GET all users in the organization (ADMIN only)
router.get('/', auth, requireRole(['ADMIN']), async (req, res) => {
    try {
        const users = await User.find({ organizationId: req.user.organizationId }).select('-password');
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error fetching team' });
    }
});

// POST to add new team member (ADMIN only)
router.post('/', auth, requireRole(['ADMIN']), async (req, res) => {
    try {
        const { name, email, role, password } = req.body;

        // Check if exists
        let existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: 'User with this email already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password || 'defaultpassword123', salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'STAFF',
            organizationId: req.user.organizationId,
            verified: true // auto verify added team members
        });

        await newUser.save();
        
        logAction(req.user.userId, req.user.organizationId, 'CREATE', 'USER', newUser._id, { role: newUser.role });

        res.status(201).json({ message: 'Team member added successfully', user: { name: newUser.name, email: newUser.email, role: newUser.role } });
    } catch (err) {
        next(err); // Pass to global error handler
    }
});

// DELETE remove team member (ADMIN only)
router.delete('/:id', auth, requireRole(['ADMIN']), async (req, res) => {
    try {
        if (req.user.userId === req.params.id) {
            return res.status(400).json({ message: "Cannot delete yourself." });
        }
        
        await User.findOneAndDelete({ _id: req.params.id, organizationId: req.user.organizationId });
        
        logAction(req.user.userId, req.user.organizationId, 'DELETE', 'USER', req.params.id);

        res.json({ message: 'Team member removed' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
