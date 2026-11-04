import crypto from 'crypto';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import Chat from '../models/Chat.js';
import { createOneTimeToken, hashToken, optionalAuth } from '../middleware/auth.js';
import { sendChatNotification } from '../utils/mailer.js';

const router = Router();
const MAX_MESSAGES = 500;
const str = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '');

const startLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });
const sendLimiter = rateLimit({ windowMs: 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false });

// Loads the conversation and checks the visitor's secret token
async function authorize(req, res) {
  const token = req.get('x-chat-token') || '';
  const chat = await Chat.findById(req.params.id).select('+tokenHash').catch(() => null);
  let ok = false;
  if (chat && token.length > 20) {
    const a = Buffer.from(hashToken(token));
    const b = Buffer.from(chat.tokenHash);
    ok = a.length === b.length && crypto.timingSafeEqual(a, b);
  }
  if (!ok) {
    res.status(404).json({ message: 'Conversation not found.' });
    return null;
  }
  return chat;
}

const view = (chat, since = 0) => ({
  total: chat.messages.length,
  status: chat.status,
  messages: chat.messages.slice(since).map(({ from, text, at }) => ({ from, text, at })),
});

// POST /api/chat/start { name, email, company, message, page, website }
router.post('/start', startLimiter, optionalAuth, async (req, res, next) => {
  try {
    const b = req.body || {};
    if (b.website) return res.status(400).json({ message: 'Invalid submission' }); // honeypot
    const name = str(b.name, 120);
    const email = str(b.email, 200).toLowerCase();
    const message = str(b.message, 2000);
    if (!name || !/^\S+@\S+\.\S+$/.test(email) || !message) return res.status(400).json({ message: 'Name, a valid email and a message are required.' });

    const { token, hash } = createOneTimeToken();
    const chat = await Chat.create({
      tokenHash: hash,
      name,
      email,
      company: str(b.company, 160),
      page: str(b.page, 300),
      user: req.user?._id,
      messages: [{ from: 'visitor', text: message }],
      unreadForAdmin: 1,
    });
    try {
      await sendChatNotification(chat, message, { isFirst: true });
    } catch (err) {
      console.error('Chat notification failed:', err.message);
    }
    res.status(201).json({ id: chat._id, token, ...view(chat) });
  } catch (err) {
    next(err);
  }
});

// POST /api/chat/:id/messages { text, since }
router.post('/:id/messages', sendLimiter, async (req, res, next) => {
  try {
    const chat = await authorize(req, res);
    if (!chat) return;
    const text = str(req.body?.text, 2000);
    if (!text) return res.status(400).json({ message: 'Type a message first.' });
    if (chat.messages.length >= MAX_MESSAGES) return res.status(400).json({ message: 'This conversation is full. Please send a quote request or an email instead.' });

    const since = Number.isInteger(req.body?.since) ? req.body.since : chat.messages.length;
    chat.messages.push({ from: 'visitor', text });
    chat.status = 'open';
    chat.lastMessageAt = new Date();
    chat.lastVisitorSeenAt = new Date();
    chat.unreadForAdmin += 1;
    await chat.save();
    try {
      await sendChatNotification(chat, text);
    } catch (err) {
      console.error('Chat notification failed:', err.message);
    }
    res.status(201).json(view(chat, since));
  } catch (err) {
    next(err);
  }
});

// GET /api/chat/:id/messages?since=N — polled by the widget
router.get('/:id/messages', async (req, res, next) => {
  try {
    const chat = await authorize(req, res);
    if (!chat) return;
    // Remember that the visitor is still on the site (so replies are not also emailed to them)
    if (Date.now() - new Date(chat.lastVisitorSeenAt).getTime() > 15000) {
      await Chat.updateOne({ _id: chat._id }, { $set: { lastVisitorSeenAt: new Date() } });
    }
    res.json(view(chat, Math.max(0, parseInt(req.query.since, 10) || 0)));
  } catch (err) {
    next(err);
  }
});

export default router;
