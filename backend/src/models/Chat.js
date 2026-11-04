import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    from: { type: String, enum: ['visitor', 'agent'], required: true },
    text: { type: String, required: true, maxlength: 2000 },
    by: String, // staff email for agent messages (internal)
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const chatSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true, select: false }, // the visitor's secret lives in their browser only
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, match: /^\S+@\S+\.\S+$/ },
    company: { type: String, trim: true, maxlength: 160 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    page: { type: String, maxlength: 300 }, // page the visitor started the chat on
    status: { type: String, enum: ['open', 'closed'], default: 'open', index: true },
    messages: [messageSchema],
    lastMessageAt: { type: Date, default: Date.now, index: true },
    lastVisitorSeenAt: { type: Date, default: Date.now }, // updated while the widget is polling
    unreadForAdmin: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Chat || mongoose.model('Chat', chatSchema);
