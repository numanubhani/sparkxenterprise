import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Check, CheckCircle2, ChevronLeft, ChevronRight, FileText, Globe2, Headphones, Lock, Minus, Plus, Tag, Trash2,
} from 'lucide-react';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useProducts } from '../context/ProductsContext.jsx';
import { COUNTRIES } from '../data/countries.js';
import { apiPost } from '../lib/api.js';
import { trackQuoteConversion } from '../lib/tracking.js';
import { useDocumentTitle } from '../lib/useDocumentTitle.js';

const EMPTY = { fullName: '', company: '', email: '', phone: '', country: '', endUserCountry: '', endUserOrg: '', targetDeliveryDate: '', message: '', website: '' };

export const inputCls =
  'h-11 w-full rounded-[4px] border border-white/20 bg-white/[0.04] px-3.5 text-sm text-white placeholder:text-slate-500 focus:border-brand-sky focus:outline-none';

export function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-slate-200">
        {label} {required && '*'}
      </span>
      {children}
    </label>
  );
}

function BlueCheck({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`grid h-[22px] w-[22px] shrink-0 place-items-center rounded border transition-colors ${
        checked ? 'border-brand bg-brand' : 'border-white/40 bg-transparent'
      }`}
    >
      {checked && <Check className="h-4 w-4" strokeWidth={3} />}
    </button>
  );
}

function CartRow({ item }) {
  const cart = useCart();
  const [noteOpen, setNoteOpen] = useState(!!item.note);

  return (
    <div className="flex flex-col gap-4 border-t border-white/10 px-5 py-5 sm:flex-row sm:items-center sm:gap-6 sm:px-6">
      <BlueCheck checked={item.selected !== false} onChange={(v) => cart.update(item.id, { selected: v })} label={`Include ${item.name}`} />
      <Link to={`/products/${item.id}`} className={`flex h-[110px] w-full items-center justify-center rounded sm:w-[210px] sm:shrink-0 ${item.dark ? '' : 'bg-white/[0.97]'}`}>
        <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain p-1" />
      </Link>
      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-semibold">
          <Link to={`/products/${item.id}`} className="hover:text-brand-sky">
            {item.name}
          </Link>
        </h3>
        <p className="mt-1 text-[15px] text-slate-300">{item.subtitle}</p>
        {item.cartTags?.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {item.cartTags.map((t) => (
              <li key={t} className="rounded-md border border-white/25 px-2.5 py-1 text-xs text-slate-200">
                {t}
              </li>
            ))}
          </ul>
        )}
        {noteOpen && (
          <textarea
            rows={2}
            value={item.note}
            onChange={(e) => cart.update(item.id, { note: e.target.value })}
            placeholder="Preferred configuration, technical requirements, compatibility needs…"
            className={`${inputCls} mt-3 h-auto py-2`}
          />
        )}
      </div>
      <div className="flex items-start gap-5">
        <div>
          <p className="mb-2 text-sm text-slate-200">Quantity</p>
          <div className="flex h-10 items-center rounded border border-brand/70">
            <button type="button" aria-label="Decrease quantity" className="grid h-full w-10 place-items-center text-brand-sky" onClick={() => cart.update(item.id, { quantity: Math.max(1, item.quantity - 1) })}>
              <Minus className="h-4 w-4" />
            </button>
            <input
              aria-label={`Quantity for ${item.name}`}
              value={item.quantity}
              onChange={(e) => cart.update(item.id, { quantity: Math.max(1, parseInt(e.target.value, 10) || 1) })}
              className="h-full w-12 border-x border-brand/40 bg-transparent text-center text-sm focus:outline-none"
            />
            <button type="button" aria-label="Increase quantity" className="grid h-full w-10 place-items-center text-brand-sky" onClick={() => cart.update(item.id, { quantity: item.quantity + 1 })}>
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button type="button" onClick={() => setNoteOpen((o) => !o)} className="mt-3 flex items-center gap-2 text-sm text-brand-sky hover:text-white">
            <FileText className="h-4 w-4" /> {noteOpen ? 'Hide note' : item.note ? 'Edit note' : 'Add note'}
          </button>
        </div>
        <button type="button" aria-label={`Remove ${item.name}`} onClick={() => cart.remove(item.id)} className="mt-7 p-1 text-slate-200 hover:text-red-300">
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function Suggestions() {
  const cart = useCart();
  const { products: PRODUCTS } = useProducts();
  const scroller = useRef(null);
  const items = PRODUCTS.filter((p) => !cart.has(p.id));
  if (!items.length) return null;
  const scroll = (dir) => scroller.current?.scrollBy({ left: dir * 230, behavior: 'smooth' });

  return (
    <section className="mt-8">
      <h2 className="px-1 text-xl font-semibold">You may also be interested in</h2>
      <div className="relative mt-4">
        <button type="button" aria-label="Previous" onClick={() => scroll(-1)} className="absolute -left-3 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-navy-900 sm:grid">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div ref={scroller} className="flex snap-x gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] sm:mx-8">
          {items.map((p) => (
            <div key={p.id} className="w-[196px] shrink-0 snap-start rounded-lg border border-white/15 bg-navy-900/70 p-3.5">
              <Link to={`/products/${p.id}`} className={`flex h-[72px] items-center justify-center rounded ${p.dark || p.darkImage ? '' : 'bg-white/[0.97]'}`}>
                <img src={p.darkImage || p.image} alt="" className="max-h-full max-w-full object-contain" loading="lazy" />
              </Link>
              <h3 className="mt-3 truncate text-[15px] font-semibold">{p.name}</h3>
              <p className="truncate text-xs text-slate-400">{p.subtitle}</p>
              <button type="button" onClick={() => cart.add(p)} className="mt-3 h-8 w-full rounded border border-brand text-xs font-semibold text-brand-sky hover:bg-brand hover:text-white">
                Add to Quote
              </button>
            </div>
          ))}
        </div>
        <button type="button" aria-label="Next" onClick={() => scroll(1)} className="absolute -right-3 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-navy-900 sm:grid">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}

const BENEFITS = [
  { icon: Tag, title: 'Written Quotations', text: 'Pricing and availability confirmed with suppliers for each request.' },
  { icon: Globe2, title: 'Worldwide Delivery', text: 'We coordinate shipping to data centers worldwide.' },
  { icon: Headphones, title: 'Expert Support', text: 'Our team will help you find the right solution.' },
];

export default function Quote() {
  useDocumentTitle('Your Quote Cart');
  const cart = useCart();
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState({ state: 'idle' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Prefill contact details for logged-in customers (only fields the user hasn't typed in)
  useEffect(() => {
    if (!user) return;
    const fromUser = { fullName: user.name, email: user.email, company: user.company?.name, phone: user.phone, country: user.company?.country };
    setForm((f) => Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v || fromUser[k] || ''])));
  }, [user]);

  const selected = cart.items.filter((i) => i.selected !== false);
  const allSelected = cart.items.length > 0 && selected.length === cart.items.length;
  const isQuote = selected.length > 0;

  const submit = async (e) => {
    e.preventDefault();
    if (!isQuote && !form.message.trim()) {
      setStatus({ state: 'error', message: 'Select at least one product, or describe what you need in the requirements field.' });
      return;
    }
    setStatus({ state: 'loading' });
    try {
      const data = await apiPost('/api/inquiries', {
        ...form,
        type: isQuote ? 'quote' : 'inquiry',
        items: selected.map((i) => ({ productId: i.id, name: i.name, category: i.category, quantity: i.quantity, note: i.note })),
      });
      if (isQuote) trackQuoteConversion(data.requestId);
      cart.removeSelected();
      setForm(EMPTY);
      setStatus({ state: 'success', requestId: data.requestId });
    } catch (err) {
      // Keep form data so the user can retry
      setStatus({ state: 'error', message: err.message });
    }
  };

  if (status.state === 'success') {
    return (
      <section className="container-site flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <CheckCircle2 className="h-16 w-16 text-brand-sky" strokeWidth={1.4} />
        <h1 className="mt-6 text-4xl font-bold">Request received</h1>
        <p className="mt-3 max-w-lg text-slate-300">
          Your request ID is <span className="font-semibold text-white">{status.requestId}</span>. A confirmation has been sent to your email and our team
          will get back to you with next steps.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link to="/products" className="btn-white h-12 px-6 text-sm">
            Continue Browsing
          </Link>
          {user ? (
            <Link to="/account/requests" className="btn-outline h-12 px-6 text-sm">
              Track in My Requests
            </Link>
          ) : (
            <Link to="/register" className="btn-outline h-12 px-6 text-sm">
              Create an account to track it
            </Link>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[radial-gradient(ellipse_at_top_left,#0b2a78_0%,#00102a_45%,#03184a_100%)]">
      <div className="container-site grid gap-8 py-9 lg:grid-cols-[1.75fr_1fr]">
        <div className="min-w-0">
          <Breadcrumb items={[{ label: 'Quote Cart' }]} />
          <h1 className="mt-4 text-4xl font-bold sm:text-5xl">
            Your <span className="text-brand-sky">Quote Cart</span>
          </h1>
          <p className="mt-3 text-[15px] text-slate-200 sm:text-base">
            Review your items and submit a request for a custom quote. Our team will confirm pricing, availability, and delivery options.
          </p>

          <div className="mt-7 overflow-hidden rounded-lg border border-white/15 bg-navy-900/50">
            {cart.items.length ? (
              <>
                <div className="flex items-center justify-between px-5 py-4 text-[15px] sm:px-6">
                  <div className="flex items-center gap-3">
                    <BlueCheck checked={allSelected} onChange={cart.setAllSelected} label="Select all items" />
                    <span>
                      {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}
                      {!allSelected && <span className="text-slate-400"> · {selected.length} selected</span>}
                    </span>
                  </div>
                  <button type="button" onClick={cart.clear} className="flex items-center gap-2 hover:text-brand-sky">
                    <Trash2 className="h-4 w-4" /> Clear Cart
                  </button>
                </div>
                {cart.items.map((item) => (
                  <CartRow key={item.id} item={item} />
                ))}
              </>
            ) : (
              <div className="px-6 py-12 text-center">
                <p className="text-lg">Your quote cart is empty.</p>
                <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
                  Add products from the catalog, or send a general sourcing inquiry with the form — no products required.
                </p>
                <Link to="/products" className="btn-white mt-6 h-11 px-6 text-sm">
                  Browse Products <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>

          <Suggestions />
        </div>

        <div className="space-y-4 lg:pt-1">
          <form onSubmit={submit} className="rounded-xl border border-white/15 bg-navy-900/70 p-6">
            <div className="flex gap-4">
              <FileText className="h-10 w-10 shrink-0 text-slate-200" strokeWidth={1.3} />
              <div>
                <h2 className="text-2xl font-semibold">{isQuote ? 'Request a Quote' : 'Send an Inquiry'}</h2>
                <p className="mt-1 text-sm text-slate-300">Tell us about your requirements and our team will get back to you with a detailed quote.</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Full Name" required>
                <input required value={form.fullName} onChange={set('fullName')} placeholder="John Smith" className={inputCls} autoComplete="name" />
              </Field>
              <Field label="Company Name" required>
                <input required value={form.company} onChange={set('company')} placeholder="Your Company Inc." className={inputCls} autoComplete="organization" />
              </Field>
              <Field label="Business Email" required>
                <input required type="email" value={form.email} onChange={set('email')} placeholder="john@company.com" className={inputCls} autoComplete="email" />
              </Field>
              <Field label="Phone Number">
                <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+1 (555) 123-4567" className={inputCls} autoComplete="tel" />
              </Field>
              <Field label="Destination Country" required>
                <select required value={form.country} onChange={set('country')} className={`${inputCls} [&>option]:text-navy-900`}>
                  <option value="">Select country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="End-User Organization" required={isQuote}>
                <input required={isQuote} value={form.endUserOrg} onChange={set('endUserOrg')} placeholder="Who will use the equipment" className={inputCls} />
              </Field>
              <Field label="End-User Country" required={isQuote}>
                <select required={isQuote} value={form.endUserCountry} onChange={set('endUserCountry')} className={`${inputCls} [&>option]:text-navy-900`}>
                  <option value="">Select country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Target Delivery Date">
                <input type="date" value={form.targetDeliveryDate} onChange={set('targetDeliveryDate')} className={`${inputCls} [color-scheme:dark]`} />
              </Field>
            </div>

            <div className="mt-4">
              <Field label={isQuote ? 'Additional Requirements (Optional)' : 'Your Requirements'} required={!isQuote}>
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={set('message')}
                  placeholder="Tell us about your project, requested configuration, or any specific requirements..."
                  className={`${inputCls} h-auto py-3`}
                />
              </Field>
            </div>

            {/* Honeypot (hidden from humans) */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} className="hidden" aria-hidden="true" />

            {status.state === 'error' && <p className="mt-4 rounded bg-red-500/10 px-3 py-2 text-sm text-red-300">{status.message}</p>}

            <button type="submit" disabled={status.state === 'loading'} className="btn-blue mt-5 h-[52px] w-full text-base disabled:opacity-60">
              {status.state === 'loading' ? 'Submitting…' : isQuote ? 'Submit Quote Request' : 'Send an Inquiry'}
              <ArrowRight className="h-4 w-4" />
            </button>

            <p className="mt-4 flex gap-3 text-xs leading-relaxed text-slate-300">
              <Lock className="h-4 w-4 shrink-0" />
              No payment required. This is a request for quotation only. Our team will confirm pricing, availability, and delivery details.
            </p>
          </form>

          <ul className="space-y-6 rounded-xl border border-white/15 bg-navy-900/70 p-6">
            {BENEFITS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-center gap-5">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-brand/70 shadow-[0_0_18px_rgba(30,110,255,.35)]">
                  <Icon className="h-6 w-6 text-brand-sky" strokeWidth={1.4} />
                </span>
                <span>
                  <span className="block font-semibold">{title}</span>
                  <span className="block text-sm text-slate-300">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
