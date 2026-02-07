const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');

async function testSignup() {
    try {
        console.log('Loading environment variables...');
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gas_subsidy';
        console.log(`Creating connection to MongoDB at ${mongoUri}...`);

        await mongoose.connect(mongoUri);
        console.log('MongoDB connected successfully');

        console.log('Current Indexes:');
        const indexes = await User.collection.getIndexes();
        console.log(JSON.stringify(indexes, null, 2));

        const testEmail = 'debugtest@example.com';

        // Cleanup existing test user
        console.log(`Cleaning up existing user with email ${testEmail}...`);
        await User.deleteOne({ email: testEmail });

        // Try to create a user
        console.log('Creating user...');
        const user = await User.create({
            email: testEmail,
            password: 'password123',
            name: 'Debug Test User',
            role: 'applicant',
            isVerified: true,
        });

        console.log('User created successfully:', user);
        process.exit(0);
    } catch (error) {
        console.error('SERVER ERROR CAUGHT:');
        console.error(error.message);
        if (error.code === 11000) {
            console.error('Duplicate key error - User already exists');
        }
        console.error('Full Error:', JSON.stringify(error, null, 2));
        process.exit(1);
    }
}

testSignup();
