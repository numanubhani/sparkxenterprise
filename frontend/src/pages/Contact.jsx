import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, CheckCircle2, Clock, Mail, PhoneCall, ShoppingCart } from 'lucide-react';
import PageHero from '../components/ui/PageHero.jsx';
import InquiryForm from '../components/forms/InquiryForm.jsx';
import { Field, inputCls } from './Quote.jsx';
import { COUNTRIES } from '../data/countries.js';
import { apiPost } from '../lib/api.js';
import { CALENDLY_URL, PUBLIC_EMAIL } from '../lib/site.js';
import { useDocumentTitle } from '../lib/useDocumentTitle.js';

const EMPTY_CALL = { fullName: '', email: '', phone: '', company: '', country: '', message: '', website: '' };

function CallForm() {
  const [form, setForm] = useState(EMPTY_CALL);
  const [status, setStatus] = useState({ state: 'idle' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ state: 'loading' });
    try {
      const data = await apiPost('/api/inquiries', { ...form, type: 'callback', inquiryType: 'Request a Call' });
      setForm(EMPTY_CALL);
      setStatus({ state: 'success', requestId: data.requestId });
    } catch (err) {
      setStatus({ state: 'error', message: err.message });
    }
  };

  if (status.state === 'success') {
    return (
      <div className="py-6 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-brand-sky" strokeWidth={1.4} />
        <p className="mt-4 text-lg font-semibold">Callback request received</p>
        <p className="mt-1 text-sm text-slate-300">
          Request ID <span className="font-semibold text-white">{status.requestId}</span>. We’ll contact you to arrange a convenient time.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <p className="text-sm text-slate-300">Leave your contact details and our team will contact you to arrange a convenient time.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Full Name" required>
          <input required value={form.fullName} onChange={set('fullName')} className={inputCls} placeholder="Your full name" autoComplete="name" />
        </Field>
        <Field label="Business Email" required>
          <input required type="email" value={form.email} onChange={set('email')} className={inputCls} placeholder="you@company.com" autoComplete="email" />
        </Field>
        <Field label="Phone Number" required>
          <input required type="tel" value={form.phone} onChange={set('phone')} className={inputCls} placeholder="+1 (555) 123-4567" autoComplete="tel" />
        </Field>
        <Field label="Company Name">
          <input value={form.company} onChange={set('company')} className={inputCls} placeholder="Optional" autoComplete="organization" />
        </Field>
      </div>
      <div className="mt-4">
        <Field label="Country">
          <select value={form.country} onChange={set('country')} className={`${inputCls} [&>option]:text-navy-900`}>
            <option value="">Select country (optional)</option>
            {COUNTRIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
      </div>
      <div className="mt-4">
        <Field label="Message / Inquiry Details">
          <textarea rows={3} value={form.message} onChange={set('message')} className={`${inputCls} h-auto py-3`} placeholder="Optional — what would you like to discuss?" />
        </Field>
      </div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} className="hidden" aria-hidden="true" />
      {status.state === 'error' && <p className="mt-4 rounded bg-red-500/10 px-3 py-2 text-sm text-red-300">{status.message}</p>}
      <button type="submit" disabled={status.state === 'loading'} className="btn-blue mt-5 h-12 w-full text-[15px] disabled:opacity-60">
        <PhoneCall className="h-4 w-4" /> {status.state === 'loading' ? 'Sending…' : 'Request a Call'}
      </button>
    </form>
  );
}

function Scheduler() {
  if (CALENDLY_URL) {
    return (
      <div>
        <p className="text-sm text-slate-300">Choose an available date and time. Times are shown in your local time zone.</p>
        <iframe title="Schedule a call" src={CALENDLY_URL} className="mt-4 h-[640px] w-full rounded-lg bg-white" loading="lazy" />
      </div>
    );
  }
  // No booking calendar connected yet — don't show fake availability (spec requirement)
  return (
    <div className="rounded-lg border border-white/15 bg-white/[0.03] p-6 text-center">
      <CalendarDays className="mx-auto h-10 w-10 text-brand-sky" strokeWidth={1.4} />
      <p className="mt-3 font-semibold">Online scheduling is being set up</p>
      <p className="mt-1 text-sm text-slate-300">In the meantime, request a call and we’ll arrange a time that suits you.</p>
    </div>
  );
}

export default function Contact() {
  useDocumentTitle('Contact Us', 'Contact SPARK X Technology about AI hardware sourcing, partnerships or general inquiries.');
  const [mode, setMode] = useState(CALENDLY_URL ? 'schedule' : 'request');

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Company', to: '/company/about' }, { label: 'Contact Us' }]}
        eyebrow="Contact"
        title="Let’s Talk"
        highlight="Technology."
        intro="Whether you need AI hardware, want to explore a partnership, or simply have a question, our team is ready to hear from you."
        image="/images/hiw-step7.jpg"
      />

      <section className="bg-light-50 text-navy-900">
        <div className="container-site grid gap-8 py-12 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <a href={`mailto:${PUBLIC_EMAIL}`} className="group flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-brand">
                <Mail className="h-7 w-7 shrink-0 text-brand" strokeWidth={1.5} />
                <span>
                  <span className="block text-sm font-semibold">Email Us</span>
                  <span className="block break-all text-sm text-brand group-hover:underline">{PUBLIC_EMAIL}</span>
                </span>
              </a>
              <Link to="/quote" className="group flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-brand">
                <ShoppingCart className="h-7 w-7 shrink-0 text-brand" strokeWidth={1.5} />
                <span>
                  <span className="block text-sm font-semibold">Hardware sourcing?</span>
                  <span className="flex items-center gap-1 text-sm text-brand group-hover:underline">
                    Request a Quote <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </span>
              </Link>
            </div>
            <InquiryForm title="Send us a message" intro="We usually reply within one business day." defaultType="Hardware Sourcing" showCountry={false} />
          </div>

          <div className="h-fit rounded-xl bg-navy-900 p-6 text-white shadow-xl sm:p-8">
            <h2 className="text-center text-2xl font-semibold">Let’s Talk Business</h2>
            <p className="mt-1 text-center text-sm text-slate-300">Discuss your AI infrastructure requirements with our team.</p>

            <div className="mt-6 grid grid-cols-2 gap-2 rounded-lg bg-white/5 p-1">
              {[
                ['schedule', CalendarDays, 'Schedule a Call'],
                ['request', PhoneCall, 'Request a Call'],
              ].map(([key, Icon, label]) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={mode === key}
                  onClick={() => setMode(key)}
                  className={`flex h-11 items-center justify-center gap-2 rounded-md text-sm font-semibold transition-colors ${
                    mode === key ? 'bg-brand text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" /> {label}
                </button>
              ))}
            </div>

            <div className="mt-6 border-t border-white/10 pt-6">{mode === 'schedule' ? <Scheduler /> : <CallForm />}</div>

            <p className="mt-6 flex items-center gap-2 text-xs text-slate-400">
              <Clock className="h-4 w-4" /> No account needed. Your details are used only to respond to your request.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
