import mongoose from 'mongoose';

export const REQUEST_STATUSES = {
  // Lead pipeline from the spec: New Lead -> Qualification -> Supplier RFQ -> Compliance Review -> Quote Prepared -> Negotiation -> Won / Lost.
  // "Quote Sent" and "Approved" are set automatically when the quote is emailed / approved by the customer.
  quote: ['New', 'Qualification', 'Supplier RFQ', 'Compliance Review', 'Quote Prepared', 'Quote Sent', 'Negotiation', 'Approved', 'Won', 'Lost', 'Closed'],
  inquiry: ['New', 'Qualification', 'Closed'],
  callback: ['New', 'Contacted', 'Scheduled', 'Completed', 'Closed'],
};
// Statuses used by earlier versions stay valid so existing records keep working
const LEGACY_STATUSES = ['Under Review', 'Supplier Pricing Requested'];
const ALL_STATUSES = [...new Set([...Object.values(REQUEST_STATUSES).flat(), ...LEGACY_STATUSES])];

const itemSchema = new mongoose.Schema(
  {
    productId: String,
    name: { type: String, required: true, trim: true },
    category: String,
    quantity: { type: Number, min: 1, default: 1 },
    note: { type: String, maxlength: 2000 },
  },
  { _id: false }
);

const quoteLineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, min: 1, default: 1 },
    unitPrice: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

const inquirySchema = new mongoose.Schema(
  {
    requestId: { type: String, unique: true, index: true },
    // quote = has products, inquiry = general message, callback = request a call
    type: { type: String, enum: ['quote', 'inquiry', 'callback'], required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },

    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, match: /^\S+@\S+\.\S+$/, index: true },
    company: { type: String, trim: true, maxlength: 160 },
    phone: { type: String, trim: true, maxlength: 40 },
    country: { type: String, trim: true, maxlength: 80 },
    inquiryType: { type: String, trim: true, maxlength: 80 },
    targetDeliveryDate: Date,
    endUserCountry: { type: String, trim: true, maxlength: 80 },
    endUserOrg: { type: String, trim: true, maxlength: 160 },
    message: { type: String, maxlength: 5000 },
    items: [itemSchema],

    status: { type: String, enum: ALL_STATUSES, default: 'New', index: true },
    statusHistory: [{ status: String, at: { type: Date, default: Date.now }, by: String, _id: false }],
    scheduledAt: Date, // callbacks

    // ---- Internal only (never sent to customers) ----
    internalNotes: { type: String, maxlength: 5000 },
    supplierName: { type: String, trim: true, maxlength: 160 },
    supplierRef: { type: String, trim: true, maxlength: 160 },
    supplierCost: { amount: Number, currency: { type: String, default: 'USD' } },
    internalLeadTime: { type: String, trim: true, maxlength: 200 },
    followUpDate: Date,
    commissionTerms: { type: String, maxlength: 2000 }, // broker commission terms
    exportScreening: { type: String, enum: ['Not started', 'In progress', 'Cleared', 'Flagged'], default: 'Not started' },

    // ---- Customer-facing quotation ----
    quote: {
      currency: { type: String, default: 'USD' },
      lines: [quoteLineSchema],
      total: Number,
      leadTime: { type: String, trim: true, maxlength: 200 },
      validUntil: Date,
      terms: { type: String, maxlength: 3000 },
      notes: { type: String, maxlength: 3000 },
      sentAt: Date,
    },
    approvedAt: Date,
  },
  { timestamps: true }
);

inquirySchema.pre('validate', function setRequestId(next) {
  if (!this.requestId) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
    this.requestId = `SPX-${date}-${rand}`;
  }
  if (this.isNew && !this.statusHistory?.length) this.statusHistory = [{ status: this.status, by: 'system' }];
  next();
});

// What a customer is allowed to see about their own request
inquirySchema.methods.toCustomer = function toCustomer() {
  const o = this.toObject();
  const hasQuote = !!o.quote?.sentAt;
  return {
    id: o._id,
    requestId: o.requestId,
    type: o.type,
    status: o.status,
    // Without "by": staff email addresses stay internal
    statusHistory: (o.statusHistory || []).map(({ status, at }) => ({ status, at })),
    fullName: o.fullName,
    email: o.email,
    company: o.company,
    phone: o.phone,
    country: o.country,
    inquiryType: o.inquiryType,
    targetDeliveryDate: o.targetDeliveryDate,
    endUserCountry: o.endUserCountry,
    endUserOrg: o.endUserOrg,
    message: o.message,
    items: o.items,
    scheduledAt: o.scheduledAt,
    quote: hasQuote ? o.quote : null,
    approvedAt: o.approvedAt,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
};

export default mongoose.models.Inquiry || mongoose.model('Inquiry', inquirySchema);
