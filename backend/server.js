const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const helmet = require('helmet');
// express-mongo-sanitize & xss-clean are incompatible with Express 5 (req.query is read-only).
// Using inline body-only sanitizers instead.
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const logger = require('./src/utils/logger');

// Load env vars
dotenv.config();

const app = express();

// Trust reverse proxy (for Render/Vercel/HTTPS setups)
app.set('trust proxy', 1);

// ─── CORS: allow localhost, any local IP, and nip.io (any port) ───────────────
const allowedOriginPatterns = [
    /^http:\/\/localhost(:\d+)?$/,                    // localhost on any port
    /^http:\/\/(10|192|172)\.\d+\.\d+\.\d+(:\d+)?$/, // any local network IP on any port
    /\.nip\.io(:\d+)?$/,                             // any nip.io domain
    /^https:\/\/vet-iota-silk\.vercel\.app$/,          // production Vercel URL
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        const allowed = allowedOriginPatterns.some(pattern => pattern.test(origin));
        if (allowed) {
            console.log(`[CORS] Allowed origin: ${origin}`);
            return callback(null, true);
        }
        console.warn(`[CORS] Blocked origin: ${origin}`);
        return callback(new Error(`CORS policy: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Middleware Stack (Enterprise B2B Security) ────────────────────────────
// 1. Set Security HTTP Headers
app.use(helmet());

// 2. Body Parser
app.use(express.json({ limit: '10kb' })); // Limit body payload
app.use(cookieParser()); // Parse cookies (for HttpOnly JWT)

// 3. Data Sanitization against NoSQL Query Injection (Express-5-safe, body-only)
app.use((req, res, next) => {
    const sanitize = (obj) => {
        if (obj && typeof obj === 'object') {
            for (const key of Object.keys(obj)) {
                if (key.startsWith('$') || key.includes('.')) {
                    delete obj[key];
                } else {
                    sanitize(obj[key]);
                }
            }
        }
    };
    if (req.body) sanitize(req.body);
    next();
});

// 4. Data Sanitization against XSS (Express-5-safe, body-only)
app.use((req, res, next) => {
    const escapeHtml = (str) =>
        typeof str === 'string'
            ? str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;').replace(/'/g, '&#x27;')
            : str;
    const sanitizeXss = (obj) => {
        if (obj && typeof obj === 'object') {
            for (const key of Object.keys(obj)) {
                if (typeof obj[key] === 'string') obj[key] = escapeHtml(obj[key]);
                else sanitizeXss(obj[key]);
            }
        }
    };
    if (req.body) sanitizeXss(req.body);
    next();
});

// 5. Global Rate Limiter (100 req per hour per IP)
const limiter = rateLimit({
    max: 1000,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// ─── Request origin logger (via structured logger) ───────────────────────────
app.use((req, res, next) => {
    const origin = req.headers.origin || req.ip || 'unknown';
    if (req.path.startsWith('/api/auth')) {
        logger.info(`${req.method} ${req.path} — origin: ${origin}`);
    }
    next();
});

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check Route
app.get('/', (req, res) => {
    res.send('AnimalCare Hub API is running');
});

// Import Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/ai', require('./src/routes/ai'));
app.use('/api/animals', require('./src/routes/animals'));
app.use('/api/appointments', require('./src/routes/appointments'));
app.use('/api/vaccinations', require('./src/routes/vaccinations'));
app.use('/api/clinics', require('./src/routes/clinics'));
app.use('/api/doctors', require('./src/routes/doctors'));
app.use('/api/consultations', require('./src/routes/consultations'));
app.use('/api/users', require('./src/routes/users'));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/animalcare';

const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

const startServer = async () => {
    // Attempt standard connection
    try {
        console.log('Attempting to connect to local MongoDB...');
        await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 });
        console.log('MongoDB Connected locally');
    } catch (err) {
        console.warn('Local MongoDB connection failed. Falling back to in-memory database...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create();
        const memoryUri = mongoServer.getUri();
        await mongoose.connect(memoryUri);
        console.log('In-memory MongoDB Connected at', memoryUri);
    }

    // Auto seed if empty
    try {
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            console.log('Seeding initial users...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123', salt);
            await User.insertMany([
                { name: "John Doe", email: "owner@vet.com", password: hashedPassword, role: "Owner" },
                { name: "Dr. Sharma", email: "vet@vet.com", password: hashedPassword, role: "Vet" },
                { name: "Admin System", email: "admin@vet.com", password: hashedPassword, role: "Admin" }
            ]);
            console.log('Users seeded successfully');
        }

        const Doctor = require('./src/models/Doctor');
        const doctorCount = await Doctor.countDocuments();
        if (doctorCount === 0) {
            console.log('Seeding initial doctor profiles...');
            const vetUser = await User.findOne({ email: 'vet@vet.com' });
            if (vetUser) {
                await Doctor.create({
                    userId: vetUser._id,
                    name: "Dr. Ravi Sharma",
                    specialization: "Small Animal Surgery",
                    experience: "10 Years",
                    qualification: "BVSc & AH, MVSc (Surgery)",
                    clinicLocation: "Downtown Pet Clinic, 123 Main St",
                    contactPhone: "+91 98765 43210",
                    contactEmail: "dr.ravi@vetsense.ai",
                    availableHours: "Mon-Sat (10 AM - 5 PM)",
                    profilePhoto: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=250&auto=format&fit=crop"
                });
                console.log('Doctor profiles seeded successfully');
            }
        }
    } catch (e) {
        console.error('Failed to auto-seed', e);
    }

    // Centralized Error Handling - Must be loaded last
    const errorHandler = require('./src/middlewares/errorHandler');
    app.use(errorHandler);

    // Bind to 0.0.0.0 so the server accepts connections from all network interfaces
    // (not just localhost). Without this, other devices on the network can't reach the backend.
    app.listen(PORT, '0.0.0.0', () => {
        logger.info(`Server running on http://0.0.0.0:${PORT}`);
        logger.info(`Local:   http://localhost:${PORT}`);
        logger.info(`Network: http://10.149.84.217:${PORT}`);
    });
};

startServer();
