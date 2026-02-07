const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function seedAdmin() {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gas_subsidy';
        await mongoose.connect(mongoUri);
        console.log('MongoDB connected');

        const adminEmail = 'admin@gas.com';
        const adminExists = await User.findOne({ email: adminEmail });

        if (adminExists) {
            console.log('Admin user already exists.');
        } else {
            console.log('Creating admin user...');
            const admin = await User.create({
                name: 'Admin',
                email: adminEmail,
                password: 'admin123', // Will be hashed by pre-save hook
                role: 'admin',
                isVerified: true,
                isActive: true,
            });
            console.log('Admin user created successfully:', admin.email);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
}

seedAdmin();
