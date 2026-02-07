const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function seedVO() {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gas_subsidy';
        await mongoose.connect(mongoUri);
        console.log('MongoDB connected');

        const email = 'officer@gas.com';
        const exists = await User.findOne({ email });

        if (exists) {
            console.log('Verification Officer exists. Updating password...');
            exists.password = 'officer123'; // New password
            exists.name = 'Officer John';
            exists.isVerified = true;
            exists.isActive = true;
            await exists.save();
            console.log('Verification Officer updated. Email: officer@gas.com, Password: officer123');
        } else {
            console.log('Creating Verification Officer...');
            const user = await User.create({
                name: 'Officer John',
                email: email,
                password: 'officer123',
                role: 'verification_officer',
                isVerified: true,
                isActive: true,
            });
            console.log('Verification Officer created. Email: officer@gas.com, Password: officer123');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error seeding VO:', error);
        process.exit(1);
    }
}

seedVO();
