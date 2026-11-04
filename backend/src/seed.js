// Seeds the catalog from the same data file the frontend uses. Run with: npm run seed
// (Run locally from the repo; the frontend folder must be next to backend/.)
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import Product from './models/Product.js';
import { PRODUCTS } from '../../frontend/src/data/products.js';

async function run() {
  await connectDB();
  for (const { id, ...p } of PRODUCTS) {
    await Product.updateOne({ slug: id }, { $set: { slug: id, ...p } }, { upsert: true });
  }
  console.log(`Seeded ${PRODUCTS.length} products`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
