// Run this script once to create the first admin user
// Usage: node seed-admin.js
// Make sure the server is running first

const API_BASE = 'http://192.168.1.7:7090/api';

async function seedAdmin() {
  console.log('🔧 Creating first admin user...\n');

  // First, try to create via auth (register with phone)
  // Since admin can't be created without another admin, we'll directly insert
  const mongoose = require('mongoose');
  
  // Connect to the same MongoDB
  require('dotenv').config({ path: '../wecare-server/.env' });
  
  const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wecare';
  
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const User = require('../wecare-server/src/models/User');
    
    // Check if admin exists
    const existing = await User.findOne({ role: 'admin' });
    if (existing) {
      console.log(`\n⚠️ Admin already exists: ${existing.name} (${existing.phoneNumber})`);
      console.log('\nLogin credentials:');
      console.log(`  Phone: ${existing.phoneNumber}`);
      console.log(`  PIN: ${existing.privacySettings?.securityPin || '1234'}`);
      await mongoose.disconnect();
      return;
    }
    
    // Create admin
    const admin = new User({
      phoneNumber: '+919999999999',
      name: 'WeCare Admin',
      email: 'admin@wecare.com',
      role: 'admin',
      isVerified: true,
      isProfileComplete: true,
      privacySettings: {
        securityPin: '1234',
        pushNotifications: true,
      },
    });
    
    await admin.save();
    
    console.log('✅ Admin created successfully!\n');
    console.log('Login credentials:');
    console.log('  Phone: +919999999999');
    console.log('  PIN: 1234');
    console.log('\n🌐 Open http://localhost:3001 to access the admin panel');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedAdmin();
