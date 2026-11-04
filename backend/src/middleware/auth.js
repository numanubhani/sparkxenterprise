import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const secret = () => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set');
  return process.env.JWT_SECRET;
};

export const signToken = (user) => jwt.sign({ sub: String(user._id), role: user.role }, secret(), { expiresIn: '7d' });

// One-time tokens for email verification / password reset. Only the hash is stored.
export function createOneTimeToken() {
  const token = crypto.randomBytes(32).toString('hex');
  return { token, hash: hashToken(token) };
}
export const hashToken = (token) => crypto.createHash('sha256').update(String(token)).digest('hex');

async function userFromHeader(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, secret());
    return await User.findById(payload.sub);
  } catch {
    return null;
  }
}

// Attaches req.user when a valid token is present; never blocks the request
export async function optionalAuth(req, res, next) {
  req.user = await userFromHeader(req);
  next();
}

export async function requireAuth(req, res, next) {
  req.user = await userFromHeader(req);
  if (!req.user) return res.status(401).json({ message: 'Please log in to continue.' });
  next();
}

export async function requireAdmin(req, res, next) {
  req.user = await userFromHeader(req);
  if (!req.user) return res.status(401).json({ message: 'Please log in to continue.' });
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required.' });
  next();
}

export const isAdminEmail = (email) =>
  (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
    .includes(String(email).toLowerCase());
