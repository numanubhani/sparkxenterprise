import { Router } from 'express';
import Inquiry from '../models/Inquiry.js';
import { sendInquiryEmails } from '../utils/mailer.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/inquiries — quote requests, general inquiries and callback requests.
// Guests can submit; when logged in, the request is linked to the account.
router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const { website, ...body } = req.body || {};
    // Honeypot field: real users never fill it in
    if (website) return res.status(400).json({ message: 'Invalid submission' });

    const items = Array.isArray(body.items) ? body.items.slice(0, 50) : [];
    const type = body.type || (items.length ? 'quote' : 'inquiry');

    if (type === 'quote' && !items.length && !body.message) {
      return res.status(400).json({ message: 'Add at least one product or a message.' });
    }
    if (type === 'quote' && (!String(body.endUserCountry || '').trim() || !String(body.endUserOrg || '').trim())) {
      return res.status(400).json({ message: 'End-user country and organization are required for a quote request.' });
    }
    if (type === 'callback' && !body.phone) {
      return res.status(400).json({ message: 'Phone number is required for a callback request.' });
    }

    const inquiry = await Inquiry.create({
      type,
      fullName: body.fullName,
      email: body.email,
      company: body.company,
      phone: body.phone,
      country: body.country,
      inquiryType: body.inquiryType,
      targetDeliveryDate: body.targetDeliveryDate || undefined,
      endUserCountry: body.endUserCountry,
      endUserOrg: body.endUserOrg,
      message: body.message,
      items,
      user: req.user?._id,
    });

    try {
      await sendInquiryEmails(inquiry);
    } catch (mailErr) {
      // The request is saved; don't fail the user because email delivery failed
      console.error('Email notification failed:', mailErr.message);
    }

    res.status(201).json({ requestId: inquiry.requestId, message: 'Request received' });
  } catch (err) {
    next(err);
  }
});

export default router;
