import mongoose from 'mongoose';

// Cache the connection across serverless invocations (Vercel reuses warm instances).
let cached = globalThis.__mongoose;
if (!cached) cached = globalThis.__mongoose = { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set');

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, { bufferCommands: false })
      .then((m) => m)
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
