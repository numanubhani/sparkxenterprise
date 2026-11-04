import { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { COUNTRIES } from '../../data/countries.js';
import { apiPost } from '../../lib/api.js';

const lightInput =
  'h-11 w-full rounded-[4px] border border-slate-300 bg-white px-3.5 text-sm text-navy-900 placeholder:text-slate-400 focus:border-brand focus:outline-none';

export const INQUIRY_TYPES = ['Hardware Sourcing', 'Partnership', 'Portfolio Inquiry', 'Other'];

// General inquiry form (light theme). Saves as type "inquiry" — no cart items required.
export default function InquiryForm({ title = 'Send an Inquiry', intro, defaultType = 'Hardware Sourcing', showCountry = true, messagePlaceholder }) {
  const empty = { fullName: '', email: '', company: '', country: '', inquiryType: defaultType, message: '', website: '' };
  const [form, setForm] = useState(empty);
  const [status, setStatus] = useState({ state: 'idle' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ state: 'loading' });
    try {
      const data = await apiPost('/api/inquiries', { ...form, type: 'inquiry' });
      setForm(empty);
      setStatus({ state: 'success', requestId: data.requestId });
    } catch (err) {
      setStatus({ state: 'error', message: err.message });
    }
  };

  if (status.state === 'success') {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-navy-900 shadow-sm">
        <CheckCircle2 className="mx-auto h-12 w-12 text-brand" strokeWidth={1.4} />
        <h3 className="mt-4 text-2xl font-semibold">Thank you — inquiry received</h3>
        <p className="mt-2 text-slate-600">
          Your inquiry ID is <span className="font-semibold text-navy-900">{status.requestId}</span>. Our team will reply by email.
        </p>
        <button type="button" onClick={() => setStatus({ state: 'idle' })} className="link-blue mt-5">
          Send another inquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-6 text-navy-900 shadow-sm sm:p-8">
      <h3 className="text-2xl font-semibold">{title}</h3>
      {intro && <p className="mt-1.5 text-sm text-slate-600">{intro}</p>}

      <fieldset className="mt-6">
        <legend className="mb-2 text-[13px] font-medium text-slate-700">What can we help you with? *</legend>
        <div className="flex flex-wrap gap-2">
          {INQUIRY_TYPES.map((t) => (
            <label
              key={t}
              className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors ${
                form.inquiryType === t ? 'border-brand bg-brand text-white' : 'border-slate-300 hover:border-brand'
              }`}
            >
              <input type="radio" name="inquiryType" value={t} checked={form.inquiryType === t} onChange={set('inquiryType')} className="sr-only" />
              {t}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-slate-700">Full name *</span>
          <input required value={form.fullName} onChange={set('fullName')} placeholder="Your full name" className={lightInput} autoComplete="name" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-slate-700">Business email *</span>
          <input required type="email" value={form.email} onChange={set('email')} placeholder="you@company.com" className={lightInput} autoComplete="email" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-slate-700">Company (optional)</span>
          <input value={form.company} onChange={set('company')} placeholder="Company name" className={lightInput} autoComplete="organization" />
        </label>
        {showCountry && (
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-slate-700">Destination country (if relevant)</span>
            <select value={form.country} onChange={set('country')} className={lightInput}>
              <option value="">Select country</option>
              {COUNTRIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-[13px] font-medium text-slate-700">Message *</span>
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={set('message')}
          placeholder={messagePlaceholder || 'Tell us how we can help...'}
          className={`${lightInput} h-auto py-3`}
        />
      </label>

      <input type="text" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} className="hidden" aria-hidden="true" />

      {status.state === 'error' && <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{status.message}</p>}

      <button type="submit" disabled={status.state === 'loading'} className="btn-blue mt-5 h-12 w-full text-[15px] disabled:opacity-60">
        {status.state === 'loading' ? 'Sending…' : 'Send an Inquiry'} <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
