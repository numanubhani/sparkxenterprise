// Promote an existing user to admin. Usage: npm run make-admin -- someone@company.com
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import User from './models/User.js';

const email = String(process.argv[2] || '').toLowerCase().trim();
if (!email) {
  console.error('Usage: npm run make-admin -- someone@company.com');
  process.exit(1);
}

await connectDB();
const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
console.log(user ? `${user.email} is now an admin` : `No user found with email ${email} — register first`);
await mongoose.disconnect();
