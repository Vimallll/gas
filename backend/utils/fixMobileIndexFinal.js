const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

async function fixIndexFinal() {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gas_subsidy';
        await mongoose.connect(mongoUri);
        console.log('MongoDB connected.');

        const indexes = await User.collection.getIndexes();
        console.log('Current Indexes:', Object.keys(indexes));

        if (indexes.mobile_1) {
            console.log('Dropping mobile_1 index...');
            await User.collection.dropIndex('mobile_1');
            console.log('Dropped mobile_1.');
        } else {
            console.log('mobile_1 index not found.');
        }

        console.log('Done. Please restart the backend server to rebuild indexes.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixIndexFinal();
