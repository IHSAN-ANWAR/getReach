import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from the server folder
dotenv.config({ path: path.join(__dirname, '.env') });

const uri = process.env.MONGODB_URI;

console.log('🔍 Testing MongoDB Atlas Connection (Server Context)...');

if (!uri) {
  console.error('❌ MONGODB_URI is still not defined. Check your server/.env file.');
  process.exit(1);
}

console.log(`🔗 Target: ${uri.split('@')[1]}`);

async function runTest() {
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ SUCCESS: Your PC is now connected to the MongoDB Atlas Cluster!');
    process.exit(0);
  } catch (err) {
    console.error('❌ CONNECTION FAILED!');
    console.error('--------------------------------------------------');
    console.error(`Error Code: ${err.reason || 'N/A'}`);
    console.error(`Error Message: ${err.message}`);
    
    if (err.message.includes('SSL routines') || err.message.includes('TLSV1')) {
      console.warn('💡 TIP: SSL/TLS Handshake failure. This is often caused by a firewall or your PC not trusting the Atlas CA.');
    } else if (err.message.includes('ETIMEDOUT') || err.message.includes('Selection timeout')) {
      console.warn('💡 TIP: Network Timeout! Your IP is likely NOT whitelisted.');
    }
    console.error('--------------------------------------------------');
    process.exit(1);
  }
}

runTest();
