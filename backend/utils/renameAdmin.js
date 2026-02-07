const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function renameAdmin() {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gas_subsidy';
        await mongoose.connect(mongoUri);
        console.log('MongoDB connected');

        const adminEmail = 'admin@gas.com';
        const result = await User.updateOne(
            { email: adminEmail },
            { $set: { name: 'Admin' } }
        );

        if (result.matchedCount > 0) {
            console.log('Admin user renamed to "Admin" successfully.');
        } else {
            console.log('Admin user not found.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error renaming admin:', error);
        process.exit(1);
    }
}

renameAdmin();
