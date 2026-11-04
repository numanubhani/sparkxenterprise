import { Router } from 'express';
import User, { KYB_STATUSES } from '../models/User.js';
import Product from '../models/Product.js';
import Upload from '../models/Upload.js';
import Chat from '../models/Chat.js';
import Inquiry, { REQUEST_STATUSES } from '../models/Inquiry.js';
import { requireAdmin } from '../middleware/auth.js';
import { esc, sendChatReplyEmail, sendMail, sendQuoteEmail } from '../utils/mailer.js';

const router = Router();
router.use(requireAdmin);

const LEAD_KINDS = Product.schema.path('leadTime.kind').enumValues;
const slugify = (s) => String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
const str = (v) => (typeof v === 'string' ? v.trim() : '');
const strList = (v) => (Array.isArray(v) ? v.map(str).filter(Boolean) : []);

// Whitelist + normalise what the admin form sends
function cleanProduct(b, { partial = false } = {}) {
  const out = {};
  const set = (k, v) => {
    if (!partial || b[k] !== undefined) out[k] = v;
  };
  ['name', 'manufacturer', 'mpn', 'sku', 'series', 'subtitle', 'description', 'image', 'darkImage', 'badge', 'publicPrice', 'supplierRef'].forEach((k) => set(k, str(b[k])));
  set('category', slugify(b.category).slice(0, 40) || undefined);
  ['highlights', 'tags', 'cartTags'].forEach((k) => set(k, strList(b[k])));
  set('specs', Array.isArray(b.specs) ? b.specs.map((r) => [str(r?.[0]), str(r?.[1])]).filter((r) => r[0] && r[1]) : []);
  ['featured', 'active', 'quoteAvailable', 'dark'].forEach((k) => set(k, !!b[k]));
  if (!partial || b.leadTime !== undefined) {
    const lt = b.leadTime || {};
    const kind = LEAD_KINDS.includes(lt.kind) ? lt.kind : 'quote-only';
    // Never invent a delivery estimate: text/source are only kept for kinds that carry supplier data
    const hasData = !['quote-only', 'needs-confirmation'].includes(kind);
    out.leadTime = { kind, text: hasData ? str(lt.text) : '', source: hasData ? str(lt.source) : '', updatedAt: new Date() };
  }
  return out;
}

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const paging = (req) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 25));
  return { page, limit, skip: (page - 1) * limit };
};

// GET /api/admin/meta — option lists for the UI
router.get('/meta', (req, res) => res.json({ statuses: REQUEST_STATUSES, kybStatuses: KYB_STATUSES }));

// GET /api/admin/stats
router.get('/stats', async (req, res, next) => {
  try {
    const [byStatus, byType, users, kybPending, recent] = await Promise.all([
      Inquiry.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Inquiry.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
      User.countDocuments(),
      User.countDocuments({ 'kyb.status': 'Submitted' }),
      Inquiry.find().sort({ createdAt: -1 }).limit(8).select('requestId type status fullName company createdAt'),
    ]);
    const toMap = (arr) => Object.fromEntries(arr.map((r) => [r._id, r.count]));
    res.json({ byStatus: toMap(byStatus), byType: toMap(byType), users, kybPending, recent });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/requests?type=&status=&q=&page=
router.get('/requests', async (req, res, next) => {
  try {
    const { page, limit, skip } = paging(req);
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.q) {
      const rx = new RegExp(escapeRegex(String(req.query.q).trim()), 'i');
      filter.$or = [{ requestId: rx }, { fullName: rx }, { email: rx }, { company: rx }, { 'items.name': rx }];
    }
    const [items, total] = await Promise.all([
      Inquiry.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).select('requestId type status fullName email company country items createdAt user'),
      Inquiry.countDocuments(filter),
    ]);
    res.json({ items, total, page, pages: Math.ceil(total / limit) || 1 });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/requests/:id
router.get('/requests/:id', async (req, res, next) => {
  try {
    const inq = await Inquiry.findById(req.params.id).populate('user', 'name email company kyb emailVerified').catch(() => null);
    if (!inq) return res.status(404).json({ message: 'Request not found' });
    res.json(inq);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/requests/:id — status, internal fields and quote draft
router.patch('/requests/:id', async (req, res, next) => {
  try {
    const inq = await Inquiry.findById(req.params.id).catch(() => null);
    if (!inq) return res.status(404).json({ message: 'Request not found' });
    const b = req.body || {};

    if (b.status && b.status !== inq.status) {
      if (!REQUEST_STATUSES[inq.type].includes(b.status)) return res.status(400).json({ message: `Invalid status for a ${inq.type} request.` });
      inq.status = b.status;
      inq.statusHistory.push({ status: b.status, by: req.user.email });
    }
    if (b.followUpDate !== undefined) inq.followUpDate = b.followUpDate || undefined;
    for (const k of ['internalNotes', 'supplierName', 'supplierRef', 'internalLeadTime', 'exportScreening', 'commissionTerms']) {
      if (b[k] !== undefined) inq[k] = b[k];
    }
    if (b.supplierCost !== undefined) inq.supplierCost = { amount: b.supplierCost?.amount === '' ? undefined : Number(b.supplierCost?.amount), currency: b.supplierCost?.currency || 'USD' };
    if (b.scheduledAt !== undefined) inq.scheduledAt = b.scheduledAt || undefined;

    if (b.quote) {
      const lines = (b.quote.lines || [])
        .filter((l) => l.name)
        .map((l) => ({ name: l.name, quantity: Math.max(1, Number(l.quantity) || 1), unitPrice: Math.max(0, Number(l.unitPrice) || 0) }));
      inq.quote = {
        ...(inq.quote?.toObject?.() || {}),
        currency: b.quote.currency || 'USD',
        lines,
        total: lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0),
        leadTime: b.quote.leadTime,
        validUntil: b.quote.validUntil || undefined,
        terms: b.quote.terms,
        notes: b.quote.notes,
      };
    }
    await inq.save();
    res.json(await inq.populate('user', 'name email company kyb emailVerified'));
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/requests/:id/send-quote — emails the quote and marks it as sent
router.post('/requests/:id/send-quote', async (req, res, next) => {
  try {
    const inq = await Inquiry.findById(req.params.id).catch(() => null);
    if (!inq) return res.status(404).json({ message: 'Request not found' });
    if (inq.type !== 'quote' && inq.type !== 'inquiry') return res.status(400).json({ message: 'Quotes can only be sent for quote or inquiry requests.' });
    if (inq.status === 'Approved') return res.status(400).json({ message: 'The customer has already approved this quote.' });
    if (!inq.quote?.lines?.length || !(inq.quote.total > 0)) return res.status(400).json({ message: 'Add at least one priced line to the quote and save it first.' });

    if (inq.type === 'inquiry') inq.type = 'quote'; // a general inquiry that turned into a quote
    inq.quote.sentAt = new Date();
    inq.status = 'Quote Sent';
    inq.statusHistory.push({ status: 'Quote Sent', by: req.user.email });
    await inq.save();

    let emailed = true;
    try {
      emailed = await sendQuoteEmail(inq);
    } catch (err) {
      emailed = false;
      console.error('Quote email failed:', err.message);
    }
    res.json({ request: await inq.populate('user', 'name email company kyb emailVerified'), emailed });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/users?q=&kyb=&page=
router.get('/users', async (req, res, next) => {
  try {
    const { page, limit, skip } = paging(req);
    const filter = {};
    if (req.query.kyb) filter['kyb.status'] = req.query.kyb;
    if (req.query.role) filter.role = req.query.role;
    if (req.query.q) {
      const rx = new RegExp(escapeRegex(String(req.query.q).trim()), 'i');
      filter.$or = [{ name: rx }, { email: rx }, { 'company.name': rx }];
    }
    const [users, total] = await Promise.all([User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit), User.countDocuments(filter)]);
    const counts = await Inquiry.aggregate([{ $match: { user: { $in: users.map((u) => u._id) } } }, { $group: { _id: '$user', count: { $sum: 1 } } }]);
    const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));
    res.json({
      items: users.map((u) => ({ ...u.toPublic(), lastLoginAt: u.lastLoginAt, requestCount: countMap[String(u._id)] || 0 })),
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/users/:id
router.get('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).catch(() => null);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const requests = await Inquiry.find({ user: user._id }).sort({ createdAt: -1 }).select('requestId type status items createdAt quote.total quote.currency');
    res.json({ user: { ...user.toPublic(), lastLoginAt: user.lastLoginAt }, requests });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/users/:id — role and KYB review decision
router.patch('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).catch(() => null);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { role, kybStatus, kybReviewNote } = req.body || {};

    if (role && role !== user.role) {
      if (String(user._id) === String(req.user._id)) return res.status(400).json({ message: 'You cannot change your own role.' });
      if (!['customer', 'admin'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
      user.role = role;
    }

    const statusChanged = kybStatus && kybStatus !== user.kyb?.status;
    if (kybStatus) {
      if (!KYB_STATUSES.includes(kybStatus)) return res.status(400).json({ message: 'Invalid KYB status' });
      user.kyb.status = kybStatus;
      user.kyb.reviewedAt = new Date();
    }
    if (kybReviewNote !== undefined) user.kyb.reviewNote = kybReviewNote;
    await user.save();

    if (statusChanged) {
      await sendMail({
        to: user.email,
        subject: `KYB review update: ${kybStatus} — SPARK X Technology`,
        html: `<p>Hi ${esc(user.name)},</p><p>Your KYB review status is now <b>${esc(kybStatus)}</b>.</p>
          ${user.kyb.reviewNote ? `<p>${esc(user.kyb.reviewNote)}</p>` : ''}
          <p>You can view details in your account under “KYB &amp; Compliance”.</p>`,
      }).catch((e) => console.error('KYB update email failed:', e.message));
    }
    res.json({ user: { ...user.toPublic(), lastLoginAt: user.lastLoginAt } });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/uploads — { filename, dataUrl } -> { url }. Images only, up to ~3 MB.
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
router.post('/uploads', async (req, res, next) => {
  try {
    const m = /^data:([\w/+.-]+);base64,([A-Za-z0-9+/=]+)$/.exec(req.body?.dataUrl || '');
    if (!m || !IMAGE_TYPES.includes(m[1])) return res.status(400).json({ message: 'Upload a PNG, JPG, WebP or GIF image.' });
    const data = Buffer.from(m[2], 'base64');
    if (!data.length || data.length > 3 * 1024 * 1024) return res.status(400).json({ message: 'Image must be under 3 MB.' });
    const file = await Upload.create({ filename: str(req.body.filename).slice(0, 120), contentType: m[1], size: data.length, data });
    res.status(201).json({ url: `${req.protocol}://${req.get('host')}/api/uploads/${file._id}` });
  } catch (err) {
    next(err);
  }
});

// ---- Live chat --------------------------------------------------------------
const chatSummary = { name: 1, email: 1, company: 1, status: 1, lastMessageAt: 1, unreadForAdmin: 1, user: 1, messages: { $slice: -1 } };

// GET /api/admin/chat-unread — number of conversations waiting for a reply (sidebar badge)
router.get('/chat-unread', async (req, res, next) => {
  try {
    res.json({ count: await Chat.countDocuments({ unreadForAdmin: { $gt: 0 } }) });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/chats?status=open|closed
router.get('/chats', async (req, res, next) => {
  try {
    const filter = ['open', 'closed'].includes(req.query.status) ? { status: req.query.status } : {};
    res.json(await Chat.find(filter).sort({ lastMessageAt: -1 }).limit(100).select(chatSummary).lean());
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/chats/:id — full history; opening it marks it as read
router.get('/chats/:id', async (req, res, next) => {
  try {
    const chat = await Chat.findByIdAndUpdate(req.params.id, { $set: { unreadForAdmin: 0 } }, { new: true }).catch(() => null);
    if (!chat) return res.status(404).json({ message: 'Conversation not found' });
    res.json(chat);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/chats/:id/reply { text } — also emails the visitor if they already left the site
router.post('/chats/:id/reply', async (req, res, next) => {
  try {
    const chat = await Chat.findById(req.params.id).catch(() => null);
    if (!chat) return res.status(404).json({ message: 'Conversation not found' });
    const text = str(req.body?.text).slice(0, 2000);
    if (!text) return res.status(400).json({ message: 'Type a reply first.' });
    const visitorAway = Date.now() - new Date(chat.lastVisitorSeenAt).getTime() > 60 * 1000;
    chat.messages.push({ from: 'agent', text, by: req.user.email });
    chat.lastMessageAt = new Date();
    chat.unreadForAdmin = 0;
    await chat.save();
    let emailed = false;
    if (visitorAway) {
      try {
        await sendChatReplyEmail(chat, text);
        emailed = true;
      } catch (err) {
        console.error('Chat reply email failed:', err.message);
      }
    }
    res.json({ chat, emailed, visitorAway });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/chats/:id { status }
router.patch('/chats/:id', async (req, res, next) => {
  try {
    if (!['open', 'closed'].includes(req.body?.status)) return res.status(400).json({ message: 'Invalid status' });
    const chat = await Chat.findByIdAndUpdate(req.params.id, { $set: { status: req.body.status } }, { new: true }).catch(() => null);
    if (!chat) return res.status(404).json({ message: 'Conversation not found' });
    res.json(chat);
  } catch (err) {
    next(err);
  }
});

// ---- Product catalog ------------------------------------------------------
// GET /api/admin/products — everything, including hidden items and internal fields
router.get('/products', async (req, res, next) => {
  try {
    res.json(await Product.find().sort({ createdAt: -1 }).lean());
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/products/import - load the bundled starter catalog (upserts by slug)
router.post('/products/import', async (req, res, next) => {
  try {
    const list = Array.isArray(req.body?.products) ? req.body.products.slice(0, 100) : [];
    let n = 0;
    for (const raw of list) {
      const slug = slugify(raw.id || raw.slug || raw.name);
      const data = cleanProduct(raw);
      if (!slug || !data.name || !data.category) continue;
      await Product.updateOne({ slug }, { $set: { ...data, slug } }, { upsert: true });
      n += 1;
    }
    res.json({ imported: n });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/products
router.post('/products', async (req, res, next) => {
  try {
    const data = cleanProduct(req.body || {});
    if (!data.name) return res.status(400).json({ message: 'Product name is required' });
    if (!data.category) return res.status(400).json({ message: 'Choose a category' });
    const base = slugify(req.body.slug || data.name);
    if (!base) return res.status(400).json({ message: 'Could not build a URL slug from that name' });
    let slug = base;
    for (let i = 2; await Product.exists({ slug }); i += 1) slug = `${base}-${i}`;
    const product = await Product.create({ ...data, slug });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/products/:slug
router.patch('/products/:slug', async (req, res, next) => {
  try {
    const data = cleanProduct(req.body || {}, { partial: true });
    if (data.name === '') return res.status(400).json({ message: 'Product name is required' });
    if ('category' in data && !data.category) return res.status(400).json({ message: 'Choose a category' });
    const product = await Product.findOneAndUpdate({ slug: req.params.slug }, { $set: data }, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/products/:slug
router.delete('/products/:slug', async (req, res, next) => {
  try {
    const r = await Product.deleteOne({ slug: req.params.slug });
    if (!r.deletedCount) return res.status(404).json({ message: 'Product not found' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
