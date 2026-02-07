const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

async function fixIndex() {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gas_subsidy';
        console.log(`Connecting to MongoDB...`);

        await mongoose.connect(mongoUri);
        console.log('MongoDB connected successfully');

        console.log('Checking indexes...');
        const indexes = await User.collection.getIndexes();
        console.log('Current indexes:', Object.keys(indexes));

        if (indexes.mobile_1) {
            console.log('Found mobile_1 index. Dropping it...');
            await User.collection.dropIndex('mobile_1');
            console.log('Successfully dropped mobile_1 index.');

            // Re-create it properly via schema (optional, but good practice if the app relies on it being sparse, 
            // though Mongoose usually handles creation on app start. We'll let app start handle re-creation properly).
            console.log('Index dropped. You should restart your application server now to ensure Mongoose rebuilds indexes correctly if needed.');
        } else {
            console.log('mobile_1 index not found. No action needed.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error fixing index:', error);
        process.exit(1);
    }
}

fixIndex();
