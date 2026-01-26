/**
 * Reset Admin Password Script
 * Use this to reset the admin password if login fails
 * 
 * Usage: npx ts-node src/scripts/resetAdminPassword.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tile-stock-management';

async function resetAdminPassword() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const adminEmail = 'admin@example.com';
    
    // Delete existing admin user
    const deleted = await User.deleteOne({ email: adminEmail });
    if (deleted.deletedCount > 0) {
      console.log('✅ Deleted existing admin user');
    }

    // Create new admin user (password will be hashed by pre-save hook)
    const admin = new User({
      email: adminEmail,
      password: 'admin123', // Will be hashed by pre-save hook
      name: 'System Admin',
      role: 'grand_admin',
      isActive: true
    });
    await admin.save();
    
    console.log('✅ Created new admin user:');
    console.log('   Email:', adminEmail);
    console.log('   Password: admin123');
    console.log('\n✅ Password reset complete!');
    console.log('You can now login with: admin@example.com / admin123');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    process.exit(1);
  }
}

resetAdminPassword();

