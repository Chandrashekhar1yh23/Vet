const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load env vars
dotenv.config();

const app = express();

// Body parser & CORS
app.use(express.json());
app.use(cors());

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check Route
app.get('/', (req, res) => {
    res.send('AnimalCare Hub API is running');
});

// Import Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/vaccinations', require('./routes/vaccinations'));
app.use('/api/animals', require('./routes/animals'));
app.use('/api/clinics', require('./routes/clinics'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/consultations', require('./routes/consultations'));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/animalcare';

const User = require('./models/User');
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

        const Doctor = require('./models/Doctor');
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

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();
