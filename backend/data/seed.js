require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Animal = require('../src/models/Animal');
const Appointment = require('../src/models/Appointment');
const Vaccination = require('../src/models/Vaccination');
const MedicalRecord = require('../src/models/MedicalRecord');
const Consultation = require('../src/models/Consultation');
const Doctor = require('../src/models/Doctor');
const Organization = require('../src/models/Organization');

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/animalcare');
        console.log('MongoDB Connected for seeding');

        // Clear existing mock data
        await User.deleteMany();

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const users = [
            { name: "John Doe", email: "owner@vet.com", password: hashedPassword, role: "Owner" },
            { name: "Dr. Sharma", email: "vet@vet.com", password: hashedPassword, role: "Vet" },
            { name: "Admin System", email: "admin@vet.com", password: hashedPassword, role: "Admin" }
        ];

        await User.insertMany(users);
        console.log('Dummy users inserted successfully.');

        console.log('\nLogin Credentials Provided:\n');
        users.forEach(u => console.log(`Role: ${u.role} | Email: ${u.email} | Password: password123`));

        process.exit();
    } catch (error) {
        console.error('Error seeding DB', error);
        process.exit(1);
    }
};

seedDB();
