import { Router } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Inquiry from '../models/Inquiry.js';
import { requireAuth } from '../middleware/auth.js';
import { PASSWORD_RULE, validPassword } from './auth.js';
import { sendMail, esc } from '../utils/mailer.js';

const router = Router();
router.use(requireAuth);

const pick = (obj = {}, keys) => Object.fromEntries(keys.filter((k) => obj[k] !== undefined).map((k) => [k, typeof obj[k] === 'string' ? obj[k].trim() : obj[k]]));

// PUT /api/account/profile — name, phone and company profile
router.put('/profile', async (req, res, next) => {
  try {
    const { name, phone, company } = req.body || {};
    if (name !== undefined && !String(name).trim()) return res.status(400).json({ message: 'Name cannot be empty.' });
    if (name !== undefined) req.user.name = name;
    if (phone !== undefined) req.user.phone = phone;
    if (company) {
      req.user.company = { ...(req.user.company?.toObject?.() || req.user.company || {}), ...pick(company, ['name', 'registrationNumber', 'country', 'address', 'website', 'jobTitle']) };
    }
    await req.user.save();
    res.json({ user: req.user.toPublic() });
  } catch (err) {
    next(err);
  }
});

// PUT /api/account/password
router.put('/password', async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    const user = await User.findById(req.user._id).select('+passwordHash');
    if (!(await bcrypt.compare(String(currentPassword || ''), user.passwordHash))) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }
    if (!validPassword(newPassword)) return res.status(400).json({ message: PASSWORD_RULE });
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/account/saved { savedProducts: [] }
router.put('/saved', async (req, res, next) => {
  try {
    const list = Array.isArray(req.body?.savedProducts) ? req.body.savedProducts : [];
    req.user.savedProducts = [...new Set(list.map(String))].slice(0, 200);
    await req.user.save();
    res.json({ savedProducts: req.user.savedProducts });
  } catch (err) {
    next(err);
  }
});

// PUT /api/account/kyb — submit or update KYB information
router.put('/kyb', async (req, res, next) => {
  try {
    if (!req.user.emailVerified) return res.status(403).json({ message: 'Please verify your email before submitting KYB information.' });
    const data = pick(req.body, ['endUser', 'intendedUse', 'installationCountry', 'installationAddress', 'thirdPartyTransfer', 'payerDifferent', 'notes']);
    const company = req.user.company || {};
    if (!company.name || !company.country || !company.registrationNumber) {
      return res.status(400).json({ message: 'Please complete your company profile (name, registration number and country) first.' });
    }
    if (!data.endUser || !data.intendedUse || !data.installationCountry || !data.installationAddress) {
      return res.status(400).json({ message: 'End user, intended use, installation country and address are required.' });
    }
    const current = req.user.kyb?.toObject?.() || {};
    // Any change re-opens the review
    req.user.kyb = { ...current, ...data, status: 'Submitted', submittedAt: new Date() };
    await req.user.save();

    await sendMail({
      to: process.env.ADMIN_NOTIFY_EMAIL,
      subject: `[SPARK X] KYB submitted — ${req.user.company?.name || req.user.email}`,
      html: `<p>${esc(req.user.name)} (${esc(req.user.email)}) submitted KYB information for ${esc(req.user.company?.name)}.</p>
        <p><a href="${(process.env.APP_URL || 'http://localhost:5173').replace(/\/$/, '')}/admin/users/${req.user._id}">Review in admin dashboard</a></p>`,
    }).catch((e) => console.error('KYB email failed:', e.message));

    res.json({ user: req.user.toPublic() });
  } catch (err) {
    next(err);
  }
});

// GET /api/account/requests
router.get('/requests', async (req, res, next) => {
  try {
    const list = await Inquiry.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(200);
    res.json(list.map((i) => i.toCustomer()));
  } catch (err) {
    next(err);
  }
});

// GET /api/account/requests/:id
router.get('/requests/:id', async (req, res, next) => {
  try {
    const inq = await Inquiry.findOne({ _id: req.params.id, user: req.user._id }).catch(() => null);
    if (!inq) return res.status(404).json({ message: 'Request not found' });
    res.json(inq.toCustomer());
  } catch (err) {
    next(err);
  }
});

// POST /api/account/requests/:id/approve — customer accepts a sent quote
router.post('/requests/:id/approve', async (req, res, next) => {
  try {
    const inq = await Inquiry.findOne({ _id: req.params.id, user: req.user._id }).catch(() => null);
    if (!inq) return res.status(404).json({ message: 'Request not found' });
    if (inq.status !== 'Quote Sent' || !inq.quote?.sentAt) return res.status(400).json({ message: 'There is no open quote to approve.' });
    if (inq.quote.validUntil && inq.quote.validUntil < new Date()) {
      return res.status(400).json({ message: 'This quote has expired. Please contact us for an updated quotation.' });
    }
    inq.status = 'Approved';
    inq.approvedAt = new Date();
    inq.statusHistory.push({ status: 'Approved', by: 'customer' });
    await inq.save();

    await sendMail({
      to: process.env.ADMIN_NOTIFY_EMAIL,
      subject: `[SPARK X] Quote approved — ${inq.requestId}`,
      html: `<p>${esc(inq.fullName)} (${esc(inq.company || inq.email)}) approved quote <b>${esc(inq.requestId)}</b>. Next step: send payment instructions.</p>`,
    }).catch((e) => console.error('Approval email failed:', e.message));

    res.json(inq.toCustomer());
  } catch (err) {
    next(err);
  }
});

export default router;
