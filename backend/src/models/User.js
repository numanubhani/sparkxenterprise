import mongoose from 'mongoose';

export const KYB_STATUSES = ['Not started', 'Submitted', 'Additional Information Required', 'Approved', 'On Hold / Declined'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, match: /^\S+@\S+\.\S+$/ },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },

    emailVerified: { type: Boolean, default: false },
    verifyTokenHash: { type: String, select: false },
    verifyExpires: { type: Date, select: false },
    resetTokenHash: { type: String, select: false },
    resetExpires: { type: Date, select: false },
    lastLoginAt: Date,

    phone: { type: String, trim: true, maxlength: 40 },
    company: {
      name: { type: String, trim: true, maxlength: 160 },
      registrationNumber: { type: String, trim: true, maxlength: 80 },
      country: { type: String, trim: true, maxlength: 80 },
      address: { type: String, trim: true, maxlength: 300 },
      website: { type: String, trim: true, maxlength: 200 },
      jobTitle: { type: String, trim: true, maxlength: 120 },
    },

    savedProducts: { type: [String], default: [] },

    // KYB information is basic business data only — sensitive documents are requested through a secure channel
    kyb: {
      status: { type: String, enum: KYB_STATUSES, default: 'Not started' },
      endUser: { type: String, trim: true, maxlength: 200 },
      intendedUse: { type: String, trim: true, maxlength: 500 },
      installationCountry: { type: String, trim: true, maxlength: 80 },
      installationAddress: { type: String, trim: true, maxlength: 300 },
      thirdPartyTransfer: { type: String, enum: ['No', 'Yes', 'Not sure'], default: 'No' },
      payerDifferent: { type: Boolean, default: false },
      notes: { type: String, trim: true, maxlength: 1000 },
      submittedAt: Date,
      reviewedAt: Date,
      reviewNote: { type: String, trim: true, maxlength: 1000 }, // shown to the customer
    },
  },
  { timestamps: true }
);

userSchema.methods.toPublic = function toPublic() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    emailVerified: this.emailVerified,
    phone: this.phone,
    company: this.company || {},
    savedProducts: this.savedProducts,
    kyb: this.kyb || { status: 'Not started' },
    createdAt: this.createdAt,
  };
};

export default mongoose.models.User || mongoose.model('User', userSchema);
