import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    manufacturer: String,
    mpn: String,
    sku: String,
    category: String, // slug; the built-in ones are gpus, servers, networking, storage, cooling, components — admins can add more
    series: String,
    subtitle: String,
    description: String,
    highlights: [String],
    tags: [String],
    cartTags: [String],
    specs: [[String]],
    dark: Boolean,
    image: String,
    darkImage: String,
    badge: String, // e.g. 'New'
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true }, // hidden from the public site when false
    quoteAvailable: { type: Boolean, default: true },
    publicPrice: String, // only when the supplier has authorised publishing a price
    supplierRef: String, // INTERNAL — never returned by the public API
    lastSyncedAt: Date,
    // Lead-time info must always carry its source (see spec section 4)
    leadTime: {
      kind: { type: String, enum: ['confirmed', 'range', 'eta', 'needs-confirmation', 'quote-only'], default: 'quote-only' },
      text: String,
      source: String,
      updatedAt: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model('Product', productSchema);
