const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');

        const nameToRemove = 'sdfgdfg';
        const result = await User.deleteMany({ name: nameToRemove });

        console.log(`Deleted ${result.deletedCount} users with name "${nameToRemove}"`);

        // Also check for the other one "gdfhgh" just in case, but only delete the requested one primarily.
        // User specifically asked for "sdfgsf" (typo of sdfgdfg).

    } catch (error) {
        console.error('Cleanup failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB disconnected');
    }
}

cleanup();
