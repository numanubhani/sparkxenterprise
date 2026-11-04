import { Router } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Inquiry from '../models/Inquiry.js';
import { createOneTimeToken, hashToken, isAdminEmail, requireAuth, signToken } from '../middleware/auth.js';
import { sendPasswordResetEmail, sendVerificationEmail } from '../utils/mailer.js';

const router = Router();
const DAY = 24 * 60 * 60 * 1000;

const validPassword = (p) => typeof p === 'string' && p.length >= 8 && /[A-Za-z]/.test(p) && /\d/.test(p);
const PASSWORD_RULE = 'Password must be at least 8 characters and include a letter and a number.';

async function issueVerification(user) {
  const { token, hash } = createOneTimeToken();
  user.verifyTokenHash = hash;
  user.verifyExpires = new Date(Date.now() + DAY);
  await user.save();
  try {
    await sendVerificationEmail(user, token);
    return true;
  } catch (err) {
    console.error('Verification email failed:', err.message);
    return false;
  }
}

// An email listed in ADMIN_EMAILS becomes admin only once its owner has verified it,
// so nobody can take over an admin address just by registering with it first.
function promoteIfAdmin(user) {
  if (user.role !== 'admin' && user.emailVerified && isAdminEmail(user.email)) user.role = 'admin';
}

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, company, website } = req.body || {};
    if (website) return res.status(400).json({ message: 'Invalid submission' }); // honeypot
    if (!name || !email) return res.status(400).json({ message: 'Name and email are required.' });
    if (!validPassword(password)) return res.status(400).json({ message: PASSWORD_RULE });

    const exists = await User.exists({ email: String(email).toLowerCase().trim() });
    if (exists) return res.status(409).json({ message: 'An account with this email already exists. Try logging in.' });

    const user = await User.create({
      name,
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role: 'customer', // admin is only granted after the email is verified (see promoteIfAdmin)
      company: { name: company },
    });
    await issueVerification(user);

    res.status(201).json({ token: signToken(user), user: user.toPublic() });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const user = await User.findOne({ email: String(email || '').toLowerCase().trim() }).select('+passwordHash');
    if (!user || !(await bcrypt.compare(String(password || ''), user.passwordHash))) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }
    promoteIfAdmin(user);
    user.lastLoginAt = new Date();
    await user.save();
    res.json({ token: signToken(user), user: user.toPublic() });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => res.json({ user: req.user.toPublic() }));

// POST /api/auth/verify-email { token }
router.post('/verify-email', async (req, res, next) => {
  try {
    const user = await User.findOne({ verifyTokenHash: hashToken(req.body?.token), verifyExpires: { $gt: new Date() } });
    if (!user) return res.status(400).json({ message: 'This verification link is invalid or has expired.' });
    user.emailVerified = true;
    promoteIfAdmin(user);
    user.verifyTokenHash = undefined;
    user.verifyExpires = undefined;
    await user.save();
    // Ownership of the email is now proven: attach earlier guest requests to the account
    const linked = await Inquiry.updateMany({ email: user.email, user: { $exists: false } }, { $set: { user: user._id } });
    res.json({ message: 'Email verified', linkedRequests: linked.modifiedCount, user: user.toPublic() });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/resend-verification
router.post('/resend-verification', requireAuth, async (req, res, next) => {
  try {
    if (req.user.emailVerified) return res.json({ message: 'Email already verified' });
    const user = await User.findById(req.user._id);
    const sent = await issueVerification(user);
    if (!sent) return res.status(502).json({ message: 'We could not send the email right now. Please try again in a few minutes.' });
    res.json({ message: 'Verification email sent' });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/forgot-password { email } — always responds the same to avoid revealing accounts
router.post('/forgot-password', async (req, res, next) => {
  try {
    const user = await User.findOne({ email: String(req.body?.email || '').toLowerCase().trim() });
    if (user) {
      const { token, hash } = createOneTimeToken();
      user.resetTokenHash = hash;
      user.resetExpires = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();
      try {
        await sendPasswordResetEmail(user, token);
      } catch (err) {
        console.error('Reset email failed:', err.message);
      }
    }
    res.json({ message: 'If an account exists for that email, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/reset-password { token, password }
router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, password } = req.body || {};
    if (!validPassword(password)) return res.status(400).json({ message: PASSWORD_RULE });
    const user = await User.findOne({ resetTokenHash: hashToken(token), resetExpires: { $gt: new Date() } });
    if (!user) return res.status(400).json({ message: 'This reset link is invalid or has expired.' });
    user.passwordHash = await bcrypt.hash(password, 12);
    user.resetTokenHash = undefined;
    user.resetExpires = undefined;
    // Clicking the emailed link also proves email ownership
    user.emailVerified = true;
    promoteIfAdmin(user);
    await user.save();
    res.json({ token: signToken(user), user: user.toPublic() });
  } catch (err) {
    next(err);
  }
});

export { validPassword, PASSWORD_RULE };
export default router;
