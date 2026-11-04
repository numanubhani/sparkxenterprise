import mongoose from 'mongoose';

// Admin-uploaded images are kept in MongoDB so they survive on serverless hosts (no writable disk).
const uploadSchema = new mongoose.Schema(
  {
    filename: String,
    contentType: { type: String, required: true },
    size: Number,
    data: { type: Buffer, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Upload || mongoose.model('Upload', uploadSchema);
