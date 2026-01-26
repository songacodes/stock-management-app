/**
 * Database Initialization Script
 * Run this to create initial shop and admin user
 * 
 * Usage: npx ts-node src/scripts/initDatabase.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Shop from '../models/Shop';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tile-stock-management';

async function initDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create default shop
    let shop = await Shop.findOne({ name: 'Main Shop' });
    if (!shop) {
      shop = new Shop({
        name: 'Main Shop',
        address: {
          city: 'Default City',
          country: 'Default Country'
        },
        contact: {
          phone: '123-456-7890',
          email: 'shop@example.com'
        },
        isActive: true
      });
      await shop.save();
      console.log('✅ Created default shop:', shop._id);
    } else {
      console.log('ℹ️  Default shop already exists:', shop._id);
    }

    // Create grand admin user
    const adminEmail = 'admin@example.com';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = new User({
        email: adminEmail,
        password: 'admin123', // Will be hashed by pre-save hook
        name: 'System Admin',
        role: 'grand_admin',
        isActive: true
      });
      await admin.save();
      console.log('✅ Created grand admin user:');
      console.log('   Email:', adminEmail);
      console.log('   Password: admin123');
      console.log('   ⚠️  Please change the password after first login!');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Create shop admin user
    const shopAdminEmail = 'shopadmin@example.com';
    let shopAdmin = await User.findOne({ email: shopAdminEmail });
    if (!shopAdmin) {
      shopAdmin = new User({
        email: shopAdminEmail,
        password: 'shop123', // Will be hashed by pre-save hook
        name: 'Shop Admin',
        role: 'shop_admin',
        shopId: shop._id,
        isActive: true
      });
      await shopAdmin.save();
      console.log('✅ Created shop admin user:');
      console.log('   Email:', shopAdminEmail);
      console.log('   Password: shop123');
      console.log('   Shop:', shop.name);
    } else {
      console.log('ℹ️  Shop admin user already exists');
    }

    console.log('\n✅ Database initialization complete!');
    console.log('\nYou can now login with:');
    console.log('  Grand Admin: admin@example.com / admin123');
    console.log('  Shop Admin: shopadmin@example.com / shop123');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase();

