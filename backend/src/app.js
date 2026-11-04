import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import inquiryRoutes from './routes/inquiries.js';
import productRoutes from './routes/products.js';
import authRoutes from './routes/auth.js';
import accountRoutes from './routes/account.js';
import adminRoutes from './routes/admin.js';
import uploadRoutes from './routes/uploads.js';
import chatRoutes from './routes/chat.js';

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.set('trust proxy', 1);
app.use(helmet());
app.use(
  cors({
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Chat-Token'],
    origin(origin, cb) {
      // Allow server-to-server tools (no origin) and whitelisted frontends
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`Origin ${origin} not allowed by CORS`));
    },
  })
);
// Image uploads arrive as base64 JSON, so that one route gets a larger limit (parsed first; the global parser then skips it)
app.use('/api/admin/uploads', express.json({ limit: '4mb' }));
app.use(express.json({ limit: '1mb' }));

app.get('/', (req, res) => res.json({ name: 'SPARK X Technology API', status: 'ok' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Make sure Mongo is connected before hitting any data route (cached between invocations)
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

const submitLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });

app.use('/api/inquiries', submitLimiter, inquiryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/chat', rateLimit({ windowMs: 15 * 60 * 1000, limit: 1500, standardHeaders: true, legacyHeaders: false }), chatRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => res.status(404).json({ message: 'Not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || (err.name === 'ValidationError' ? 400 : 500);
  res.status(status).json({ message: status === 500 ? 'Server error' : err.message });
});

export default app;
