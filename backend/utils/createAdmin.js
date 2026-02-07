const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdminUser = async () => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gas-subsidy';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@gas.gov.in' });

        if (existingAdmin) {
            console.log('Admin user already exists!');
            console.log('Email: admin@gas.gov.in');
            process.exit(0);
        }

        // Create admin user
        const admin = await User.create({
            email: 'admin@gas.gov.in',
            password: 'Admin@123',
            name: 'System Administrator',
            role: 'admin',
            isVerified: true,
            isActive: true,
        });

        console.log('✓ Admin user created successfully!');
        console.log('================================');
        console.log('Email: admin@gas.gov.in');
        console.log('Password: Admin@123');
        console.log('================================');
        console.log('IMPORTANT: Please change the password after first login!');

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
};

createAdminUser();
