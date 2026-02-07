const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Database Reset Script
 * 
 * WARNING: This will delete ALL data from the database!
 * Use this script only in development when you need to reset the database
 * after schema changes (like adding required email/password fields to User model).
 * 
 * After running this script, you'll need to run createAdmin.js to create
 * the admin user again.
 */

const resetDatabase = async () => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gas-subsidy';
        await mongoose.connect(mongoUri);
        console.log('✓ Connected to MongoDB');

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        console.log('\\n⚠️  WARNING: This will delete ALL data from the database!');
        console.log('Collections to be dropped:');
        collections.forEach((collection) => {
            console.log(`  - ${collection.collectionName}`);
        });

        // Drop all collections
        for (const collection of collections) {
            await collection.drop();
            console.log(`✓ Dropped collection: ${collection.collectionName}`);
        }

        console.log('\\n✓ Database reset complete!');
        console.log('\\nNext steps:');
        console.log('1. Run: node utils/createAdmin.js (to create admin user)');
        console.log('2. Restart your backend server');
        console.log('3. Test the application');

        process.exit(0);
    } catch (error) {
        console.error('Error resetting database:', error);
        process.exit(1);
    }
};

resetDatabase();
