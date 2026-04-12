const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const Organization = require('../models/Organization');
const { sendVerificationEmail, sendMockSMS, sendOTPEmail } = require('../utils/notifier');
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID');

const REFRESH_SECRET = process.env.REFRESH_SECRET || 'your_refresh_secret_key_here';
const logAction = require('../utils/auditLogger');

// Helper to generate tokens and set cookies
const setTokenCookies = (res, user) => {
    const payload = { userId: user._id, role: user.role, organizationId: user.organizationId };
    
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret_key_here', { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });

    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 15 * 60 * 1000 // 15 mins
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return { accessToken, refreshToken };
};

const router = express.Router();

// Rate limiting for auth (Max 5 requests/minute per IP)
const authLimiter = rateLimit({ windowMs: 1 * 60 * 1000, max: 5, message: "Too many authentication requests, please try again after a minute." });

router.post('/register', authLimiter, async (req, res) => {
    try {
        const { name, email, password, clinicName, clinicPhone, clinicAddress } = req.body;

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate Validation Token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        let orgName = clinicName || `${name}'s Clinic`;
        
        // 1. Create Organization
        const org = new Organization({
            name: orgName,
            email: email,
            phone: clinicPhone || '0000000000',
            address: clinicAddress || 'Not Provided'
        });
        await org.save();

        // 2. Create User linked to Organization as ADMIN
        user = new User({
            name, email, password: hashedPassword, role: 'ADMIN',
            organizationId: org._id,
            verificationToken
        });

        await user.save();
        await sendVerificationEmail(user.email, verificationToken);

        res.status(201).json({ message: 'Registration successful! Please check your email to verify your account.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get('/verify-email/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const user = await User.findOne({ verificationToken: token });

        if (!user) return res.status(400).send('Invalid or expired verification link.');

        user.verified = true;
        user.verificationToken = undefined;
        await user.save();

        const frontendUrl = process.env.FRONTEND_URL || 'https://vet-iota-silk.vercel.app';
        res.redirect(`${frontendUrl}/auth?verified=true`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.post('/login', authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        setTokenCookies(res, user);
        
        logAction(user._id, user.organizationId, 'LOGIN', 'USER', user._id, { login_type: 'password' });
        
        res.json({ message: 'Login successful', user: { id: user._id, name: user.name, email: user.email, role: user.role, organizationId: user.organizationId } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/verify-otp', authLimiter, async (req, res) => {
    try {
        const { userId, otpCode } = req.body;
        const user = await User.findById(userId);

        if (!user) return res.status(400).json({ message: 'User not found' });

        if (user.otpAttempts >= 3) {
            return res.status(429).json({ message: 'Too many failed attempts. Please request a new OTP.' });
        }

        if (!user.otpCode || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'OTP has expired or is invalid.' });
        }

        const isMatch = await bcrypt.compare(otpCode, user.otpCode);
        if (!isMatch) {
            user.otpAttempts += 1;
            await user.save();
            return res.status(400).json({ message: `Invalid OTP code. Attempts remaining: ${3 - user.otpAttempts}` });
        }

        // Clear OTP
        user.otpCode = undefined;
        user.otpExpires = undefined;
        user.otpAttempts = 0;
        await user.save();

        setTokenCookies(res, user);
        
        logAction(user._id, user.organizationId, 'LOGIN', 'USER', user._id, { login_type: 'otp' });
        
        res.json({ message: 'OTP verified', user: { id: user._id, name: user.name, email: user.email, role: user.role, organizationId: user.organizationId } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/google-login', authLimiter, async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) return res.status(400).json({ message: 'No credential provided' });

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
        });
        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        let user = await User.findOne({ email });
        if (!user) {
            // Check if there is an organization mapping
            const org = new Organization({
                name: `${name}'s Clinic`,
                email: email,
                phone: '0000000000'
            });
            await org.save();

            user = new User({
                name,
                email,
                password: crypto.randomBytes(16).toString('hex'),
                role: 'ADMIN',
                organizationId: org._id,
                login_type: 'google',
                verified: true
            });
            await user.save();
        }

        setTokenCookies(res, user);
        res.json({ message: 'Google login successful', user: { id: user._id, name: user.name, email: user.email, role: user.role, organizationId: user.organizationId, picture } });
    } catch (err) {
        console.error('Google Auth Error:', err);
        res.status(500).json({ message: 'Google Authentication Failed' });
    }
});

router.post('/send-otp', authLimiter, async (req, res) => {
    try {
        const { email } = req.body;
        let user = await User.findOne({ email });

        if (!user) {
            const org = new Organization({
                name: `${email.split('@')[0]}'s Clinic`,
                email: email,
                phone: '0000000000'
            });
            await org.save();

            // Auto-create user if they don't exist for OTP login
            user = new User({
                name: email.split('@')[0],
                email,
                password: crypto.randomBytes(16).toString('hex'),
                role: 'ADMIN',
                organizationId: org._id,
                login_type: 'email',
                verified: true
            });
            await user.save();
        }

        // Generate a cryptographically secure 6-digit OTP
        const otpCode = crypto.randomInt(100000, 1000000).toString();

        // Hash before saving
        const hashedOtp = await bcrypt.hash(otpCode, 10);
        user.otpCode = hashedOtp;
        user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 mins expiration
        user.otpAttempts = 0; // Reset attempts on new OTP
        await user.save();

        try {
            await sendOTPEmail(user.email, otpCode);
            res.json({ message: 'OTP sent to your email', userId: user._id });
        } catch (emailErr) {
            console.warn('Gmail blocked the email attempt. Forwarding OTP to frontend for demo purposes.', emailErr.message);
            res.json({ 
                message: `Email blocked by Gmail. DEMO BYPASS MODE: Your OTP is ${otpCode}`, 
                userId: user._id 
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error sending OTP' });
    }
});

// Refresh Endpoint
router.post('/refresh', (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });

    jwt.verify(refreshToken, REFRESH_SECRET, async (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Invalid refresh token' });
        
        try {
            const user = await User.findById(decoded.userId);
            if (!user) return res.status(403).json({ message: 'User deleted' });

            setTokenCookies(res, user);
            res.json({ message: 'Tokens refreshed' });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    });
});

// Logout
router.post('/logout', (req, res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
});

module.exports = router;
