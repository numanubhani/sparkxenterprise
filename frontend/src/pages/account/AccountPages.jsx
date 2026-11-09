import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Bookmark, CheckCircle2, Clock, FileText, ListChecks, Receipt, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { api } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { TYPE_LABELS, fmtDate, fmtMoney, itemsSummary } from '../../lib/format.js';
import { COUNTRIES } from '../../data/countries.js';
import { useProducts } from '../../context/ProductsContext.jsx';
import ProductCard from '../../components/ui/ProductCard.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { Card, Empty, ErrorNote, Field, Loading, PageTitle, SuccessNote, lightInput } from './ui.jsx';

const OPEN_STATUSES = ['New', 'Under Review', 'Supplier Pricing Requested', 'Qualification', 'Supplier RFQ', 'Compliance Review', 'Quote Prepared', 'Quote Sent', 'Negotiation', 'Contacted', 'Scheduled'];

function RequestsTable({ requests }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3 font-semibold">Request</th>
            <th className="px-4 py-3 font-semibold">Type</th>
            <th className="px-4 py-3 font-semibold">Items</th>
            <th className="px-4 py-3 font-semibold">Submitted</th>
            <th className="px-4 py-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {requests.map((r) => (
            <tr key={r.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <Link to={`/account/requests/${r.id}`} className="font-semibold text-brand hover:underline">
                  {r.requestId}
                </Link>
              </td>
              <td className="px-4 py-3 text-slate-600">{TYPE_LABELS[r.type]}</td>
              <td className="px-4 py-3 text-slate-600">{itemsSummary(r.items)}</td>
              <td className="px-4 py-3 text-slate-600">{fmtDate(r.createdAt)}</td>
              <td className="px-4 py-3">
                <StatusBadge status={r.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------- Dashboard ------------------------------- */
export function AccountDashboard() {
  const { user } = useAuth();
  const { saved } = useCart();
  const { data, loading, error } = useApi('/api/account/requests');
  const requests = data || [];
  const open = requests.filter((r) => OPEN_STATUSES.includes(r.status)).length;
  const quotesToReview = requests.filter((r) => r.status === 'Quote Sent').length;

  const stats = [
    { icon: ListChecks, label: 'Open requests', value: open, to: '/account/requests' },
    { icon: Receipt, label: 'Quotes to review', value: quotesToReview, to: '/account/quotes' },
    { icon: Bookmark, label: 'Saved products', value: saved.length, to: '/account/saved' },
    { icon: ShieldCheck, label: 'KYB status', value: user.kyb?.status || 'Not started', to: '/account/kyb', small: true },
  ];

  return (
    <>
      <PageTitle title={`Welcome, ${user.name.split(' ')[0]}`} subtitle="Here’s an overview of your requests and account." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ icon: Icon, label, value, to, small }) => (
          <Link key={label} to={to} className="rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md">
            <Icon className="h-6 w-6 text-brand" strokeWidth={1.6} />
            <p className={`mt-3 font-bold ${small ? 'text-base' : 'text-3xl'}`}>{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </Link>
        ))}
      </div>

      {quotesToReview > 0 && (
        <div className="mt-6 flex flex-col items-start justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 p-5 sm:flex-row sm:items-center">
          <p className="text-sm text-blue-900">
            You have <b>{quotesToReview}</b> quotation{quotesToReview > 1 ? 's' : ''} waiting for your review.
          </p>
          <Link to="/account/quotes" className="btn-blue h-10 px-5 text-sm">
            Review quotes <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent requests</h2>
          <Link to="/account/requests" className="link-blue">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorNote msg={error} />
        ) : requests.length ? (
          <RequestsTable requests={requests.slice(0, 5)} />
        ) : (
          <Empty>
            No requests yet.{' '}
            <Link to="/products" className="font-semibold text-brand">
              Browse products
            </Link>{' '}
            or{' '}
            <Link to="/quote" className="font-semibold text-brand">
              send an inquiry
            </Link>
            .
          </Empty>
        )}
      </div>
    </>
  );
}

/* ------------------------------- My Requests ------------------------------ */
export function MyRequests() {
  const { data, loading, error } = useApi('/api/account/requests');
  const [tab, setTab] = useState('all');
  const list = (data || []).filter((r) => tab === 'all' || r.type === tab);
  const tabs = [
    ['all', 'All'],
    ['quote', 'Quotes'],
    ['inquiry', 'Inquiries'],
    ['callback', 'Callbacks'],
  ];

  return (
    <>
      <PageTitle
        title="My Requests"
        subtitle="Every quote request, inquiry and callback you’ve sent while logged in, or with your verified email."
        action={
          <Link to="/quote" className="btn-blue h-10 px-5 text-sm">
            New request <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map(([k, l]) => (
          <button key={k} type="button" onClick={() => setTab(k)} className={`rounded-full px-4 py-1.5 text-sm ${tab === k ? 'bg-navy-900 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-slate-400'}`}>
            {l}
          </button>
        ))}
      </div>
      {loading ? <Loading /> : error ? <ErrorNote msg={error} /> : list.length ? <RequestsTable requests={list} /> : <Empty>No requests in this view yet.</Empty>}
    </>
  );
}

/* ----------------------------- Request detail ----------------------------- */
export function RequestDetail() {
  const { id } = useParams();
  const { data: r, loading, error, setData } = useApi(`/api/account/requests/${id}`);
  const [approve, setApprove] = useState({ loading: false, error: '' });

  if (loading) return <Loading />;
  if (error) return <ErrorNote msg={error} />;

  const canApprove = r.status === 'Quote Sent' && r.quote && (!r.quote.validUntil || new Date(r.quote.validUntil) >= new Date());

  const doApprove = async () => {
    if (!window.confirm('Approve this quotation? Our team will then send payment instructions (100% advance payment).')) return;
    setApprove({ loading: true, error: '' });
    try {
      setData(await api(`/api/account/requests/${id}/approve`, { method: 'POST' }));
      setApprove({ loading: false, error: '' });
    } catch (err) {
      setApprove({ loading: false, error: err.message });
    }
  };

  return (
    <>
      <Link to="/account/requests" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-navy-900">
        <ArrowLeft className="h-4 w-4" /> All requests
      </Link>
      <PageTitle title={r.requestId} subtitle={`${TYPE_LABELS[r.type]} · submitted ${fmtDate(r.createdAt, true)}`} action={<StatusBadge status={r.status} className="text-sm" />} />

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="min-w-0 space-y-6">
          {r.quote && (
            <Card title="Your quotation" action={<span className="text-xs text-slate-500">Sent {fmtDate(r.quote.sentAt)}</span>}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-sm">
                  <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="pb-2">Item</th>
                      <th className="pb-2 text-right">Qty</th>
                      <th className="pb-2 text-right">Unit price</th>
                      <th className="pb-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {r.quote.lines.map((l, i) => (
                      <tr key={i}>
                        <td className="py-2.5">{l.name}</td>
                        <td className="py-2.5 text-right">{l.quantity}</td>
                        <td className="py-2.5 text-right">{fmtMoney(l.unitPrice, r.quote.currency)}</td>
                        <td className="py-2.5 text-right">{fmtMoney(l.unitPrice * l.quantity, r.quote.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-200">
                      <td colSpan={3} className="pt-3 text-right font-semibold">
                        Total
                      </td>
                      <td className="pt-3 text-right text-lg font-bold">{fmtMoney(r.quote.total, r.quote.currency)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                {r.quote.leadTime && (
                  <div>
                    <dt className="text-slate-500">Estimated lead time</dt>
                    <dd className="font-medium">{r.quote.leadTime}</dd>
                  </div>
                )}
                {r.quote.validUntil && (
                  <div>
                    <dt className="text-slate-500">Valid until</dt>
                    <dd className="font-medium">{fmtDate(r.quote.validUntil)}</dd>
                  </div>
                )}
              </dl>
              {r.quote.terms && <p className="mt-4 whitespace-pre-line text-sm text-slate-700">{r.quote.terms}</p>}
              {r.quote.notes && <p className="mt-3 whitespace-pre-line text-sm text-slate-700">{r.quote.notes}</p>}
              <p className="mt-4 rounded bg-slate-50 p-3 text-xs text-slate-600">100% advance payment is required before the order is placed with the supplier. Payment instructions are sent after approval.</p>

              <div className="mt-5">
                <ErrorNote msg={approve.error} />
                {r.status === 'Approved' ? (
                  <p className="flex items-center gap-2 font-semibold text-emerald-700">
                    <CheckCircle2 className="h-5 w-5" /> You approved this quote on {fmtDate(r.approvedAt)}.
                  </p>
                ) : canApprove ? (
                  <button type="button" onClick={doApprove} disabled={approve.loading} className="btn-blue mt-2 h-11 px-6 text-sm disabled:opacity-60">
                    <CheckCircle2 className="h-4 w-4" /> {approve.loading ? 'Approving…' : 'Approve quotation'}
                  </button>
                ) : r.status === 'Quote Sent' ? (
                  <p className="text-sm text-red-700">This quote has expired. Please contact us for an updated quotation.</p>
                ) : null}
              </div>
            </Card>
          )}

          <Card title="Requested items">
            {r.items?.length ? (
              <ul className="divide-y divide-slate-100">
                {r.items.map((it, i) => (
                  <li key={i} className="flex justify-between gap-4 py-3 text-sm">
                    <span>
                      <span className="font-medium">{it.name}</span>
                      {it.note && <span className="mt-0.5 block text-slate-500">Note: {it.note}</span>}
                    </span>
                    <span className="shrink-0 text-slate-600">× {it.quantity}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-600">No products — general {r.type === 'callback' ? 'callback request' : 'inquiry'}.</p>
            )}
            {r.message && (
              <div className="mt-4 border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Your message</p>
                <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{r.message}</p>
              </div>
            )}
          </Card>
        </div>

        <div className="min-w-0 space-y-6">
          <Card title="Progress">
            <ol className="space-y-4">
              {(r.statusHistory || []).map((h, i) => (
                <li key={i} className="flex gap-3">
                  <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${i === r.statusHistory.length - 1 ? 'bg-brand' : 'bg-slate-300'}`} />
                  <span>
                    <span className="block text-sm font-medium">{h.status}</span>
                    <span className="block text-xs text-slate-500">{fmtDate(h.at, true)}</span>
                  </span>
                </li>
              ))}
            </ol>
            {r.scheduledAt && (
              <p className="mt-4 flex items-center gap-2 rounded bg-blue-50 p-3 text-sm text-blue-900">
                <Clock className="h-4 w-4" /> Call scheduled for {fmtDate(r.scheduledAt, true)}
              </p>
            )}
          </Card>
          <Card title="Contact details">
            <dl className="space-y-2 text-sm">
              {[
                ['Name', r.fullName],
                ['Company', r.company],
                ['Email', r.email],
                ['Phone', r.phone],
                ['Destination', r.country],
                ['End user', r.endUserOrg && `${r.endUserOrg}${r.endUserCountry ? ` (${r.endUserCountry})` : ''}`],
                ['Target delivery', r.targetDeliveryDate && fmtDate(r.targetDeliveryDate)],
              ]
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className="flex flex-wrap justify-between gap-x-4 gap-y-0.5">
                    <dt className="shrink-0 text-slate-500">{k}</dt>
                    <dd className="min-w-0 break-words text-right font-medium">{v}</dd>
                  </div>
                ))}
            </dl>
          </Card>
        </div>
      </div>
    </>
  );
}

/* -------------------------------- My Quotes ------------------------------- */
export function MyQuotes() {
  const { data, loading, error } = useApi('/api/account/requests');
  const quotes = (data || []).filter((r) => r.quote);

  return (
    <>
      <PageTitle title="My Quotes" subtitle="Formal quotations prepared by our team after supplier and compliance checks." />
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorNote msg={error} />
      ) : quotes.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {quotes.map((r) => (
            <Link key={r.id} to={`/account/requests/${r.id}`} className="rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <span className="font-semibold text-brand">{r.requestId}</span>
                <StatusBadge status={r.status} />
              </div>
              <p className="mt-3 text-2xl font-bold">{fmtMoney(r.quote.total, r.quote.currency)}</p>
              <p className="mt-1 text-sm text-slate-600">{itemsSummary(r.quote.lines)}</p>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                <span>Sent {fmtDate(r.quote.sentAt)}</span>
                {r.quote.validUntil && <span>Valid until {fmtDate(r.quote.validUntil)}</span>}
                {r.quote.leadTime && <span>Lead time: {r.quote.leadTime}</span>}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <Empty>No quotations yet. When our team sends you a quote, it will appear here and you can approve it online.</Empty>
      )}
    </>
  );
}

/* ----------------------------- Saved products ----------------------------- */
export function SavedProducts() {
  const cart = useCart();
  const { products: PRODUCTS } = useProducts();
  const saved = PRODUCTS.filter((p) => cart.isSaved(p.id));
  return (
    <>
      <PageTitle title="Saved Products" subtitle="Products you’ve bookmarked. They’re stored in your account and available on any device." />
      {saved.length ? (
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {saved.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <Empty>
          You haven’t saved any products yet. Use the bookmark icon on any product.{' '}
          <Link to="/products" className="font-semibold text-brand">
            Browse products
          </Link>
        </Empty>
      )}
    </>
  );
}

/* ----------------------------- Company profile ---------------------------- */
export function CompanyProfile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user.company?.name || '',
    registrationNumber: user.company?.registrationNumber || '',
    country: user.company?.country || '',
    address: user.company?.address || '',
    website: user.company?.website || '',
    jobTitle: user.company?.jobTitle || '',
    phone: user.phone || '',
  });
  const [state, setState] = useState({ loading: false, error: '', ok: '' });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setState({ loading: true, error: '', ok: '' });
    try {
      const { phone, ...company } = form;
      const d = await api('/api/account/profile', { method: 'PUT', body: { phone, company } });
      setUser(d.user);
      setState({ loading: false, error: '', ok: 'Company profile saved.' });
    } catch (err) {
      setState({ loading: false, error: err.message, ok: '' });
    }
  };

  return (
    <>
      <PageTitle title="Company Profile" subtitle="Used to prefill your requests and for KYB verification." />
      <Card>
        <form onSubmit={submit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Legal company name" required>
              <input required value={form.name} onChange={set('name')} className={lightInput} autoComplete="organization" />
            </Field>
            <Field label="Registration number" hint="Company / business registration number">
              <input value={form.registrationNumber} onChange={set('registrationNumber')} className={lightInput} />
            </Field>
            <Field label="Country of registration">
              <select value={form.country} onChange={set('country')} className={lightInput}>
                <option value="">Select country</option>
                {COUNTRIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Website">
              <input value={form.website} onChange={set('website')} className={lightInput} placeholder="https://" />
            </Field>
          </div>
          <Field label="Registered address">
            <input value={form.address} onChange={set('address')} className={lightInput} autoComplete="street-address" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Your job title">
              <input value={form.jobTitle} onChange={set('jobTitle')} className={lightInput} autoComplete="organization-title" />
            </Field>
            <Field label="Phone number">
              <input type="tel" value={form.phone} onChange={set('phone')} className={lightInput} autoComplete="tel" />
            </Field>
          </div>
          <ErrorNote msg={state.error} />
          <SuccessNote msg={state.ok} />
          <button type="submit" disabled={state.loading} className="btn-blue h-11 px-6 text-sm disabled:opacity-60">
            {state.loading ? 'Saving…' : 'Save company profile'}
          </button>
        </form>
      </Card>
    </>
  );
}

/* ------------------------------ KYB & Compliance ----------------------------- */
export function KybCompliance() {
  const { user, setUser } = useAuth();
  const kyb = user.kyb || {};
  const [form, setForm] = useState({
    endUser: kyb.endUser || '',
    intendedUse: kyb.intendedUse || '',
    installationCountry: kyb.installationCountry || '',
    installationAddress: kyb.installationAddress || '',
    thirdPartyTransfer: kyb.thirdPartyTransfer || 'No',
    payerDifferent: !!kyb.payerDifferent,
    notes: kyb.notes || '',
  });
  const [state, setState] = useState({ loading: false, error: '', ok: '' });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const companyIncomplete = !user.company?.name || !user.company?.registrationNumber || !user.company?.country;
  const blocked = !user.emailVerified || companyIncomplete;

  const submit = async (e) => {
    e.preventDefault();
    setState({ loading: true, error: '', ok: '' });
    try {
      const d = await api('/api/account/kyb', { method: 'PUT', body: form });
      setUser(d.user);
      setState({ loading: false, error: '', ok: 'KYB information submitted. Our team will review it and update the status here.' });
    } catch (err) {
      setState({ loading: false, error: err.message, ok: '' });
    }
  };

  return (
    <>
      <PageTitle title="KYB & Compliance" subtitle="Know Your Business information required for high-technology equipment." />
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card className="min-w-0">
          {blocked && (
            <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              {!user.emailVerified ? 'Verify your email address before submitting KYB information.' : (
                <>
                  Please complete your{' '}
                  <Link to="/account/company" className="font-semibold underline">
                    company profile
                  </Link>{' '}
                  (legal name, registration number and country) first.
                </>
              )}
            </div>
          )}
          <form onSubmit={submit} className="space-y-5">
            <fieldset disabled={blocked} className="space-y-5">
              <Field label="End user" required hint="The organization that will actually use the equipment">
                <input required value={form.endUser} onChange={set('endUser')} className={lightInput} />
              </Field>
              <Field label="Intended use" required hint="e.g. AI model training, inference, HPC research">
                <textarea required rows={3} value={form.intendedUse} onChange={set('intendedUse')} className={`${lightInput} h-auto py-3`} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Installation country" required>
                  <select required value={form.installationCountry} onChange={set('installationCountry')} className={lightInput}>
                    <option value="">Select country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Will equipment be transferred to third parties or another country?">
                  <select value={form.thirdPartyTransfer} onChange={set('thirdPartyTransfer')} className={lightInput}>
                    {['No', 'Yes', 'Not sure'].map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Full installation address" required hint="Physical location where the equipment will be installed">
                <input required value={form.installationAddress} onChange={set('installationAddress')} className={lightInput} />
              </Field>
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" checked={form.payerDifferent} onChange={set('payerDifferent')} className="h-4 w-4 accent-brand" />
                The receiving or paying organization is different from my company
              </label>
              <Field label="Additional information">
                <textarea rows={3} value={form.notes} onChange={set('notes')} className={`${lightInput} h-auto py-3`} />
              </Field>
            </fieldset>
            <ErrorNote msg={state.error} />
            <SuccessNote msg={state.ok} />
            <button type="submit" disabled={blocked || state.loading} className="btn-blue h-11 px-6 text-sm disabled:opacity-50">
              <ShieldCheck className="h-4 w-4" /> {state.loading ? 'Submitting…' : kyb.status && kyb.status !== 'Not started' ? 'Update & resubmit' : 'Submit for review'}
            </button>
            <p className="text-xs text-slate-500">Please don’t upload or paste sensitive documents here. If documents are needed, our team will request them through a secure channel.</p>
          </form>
        </Card>

        <div className="min-w-0 space-y-6">
          <Card title="Review status">
            <StatusBadge status={kyb.status || 'Not started'} className="text-sm" />
            {kyb.submittedAt && <p className="mt-3 text-sm text-slate-600">Submitted {fmtDate(kyb.submittedAt, true)}</p>}
            {kyb.reviewedAt && <p className="text-sm text-slate-600">Last reviewed {fmtDate(kyb.reviewedAt, true)}</p>}
            {kyb.reviewNote && <p className="mt-3 rounded bg-slate-50 p-3 text-sm text-slate-700">{kyb.reviewNote}</p>}
            <p className="mt-4 text-xs text-slate-500">“Approved” means the review was passed. It does not replace any export license or government authorization that may be required.</p>
          </Card>
          <Card title="Why we ask">
            <p className="text-sm text-slate-600">Advanced GPUs and AI infrastructure are subject to export-control and sanctions rules. Requirements depend on the product, destination and transaction.</p>
            <Link to="/resources/kyb-verification" className="link-blue mt-3">
              KYB verification process <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
        </div>
      </div>
    </>
  );
}

/* ----------------------------- Account settings ---------------------------- */
export function AccountSettings() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: user.name });
  const [pState, setPState] = useState({ loading: false, error: '', ok: '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwState, setPwState] = useState({ loading: false, error: '', ok: '' });

  const saveProfile = async (e) => {
    e.preventDefault();
    setPState({ loading: true, error: '', ok: '' });
    try {
      const d = await api('/api/account/profile', { method: 'PUT', body: profile });
      setUser(d.user);
      setPState({ loading: false, error: '', ok: 'Saved.' });
    } catch (err) {
      setPState({ loading: false, error: err.message, ok: '' });
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pw.newPassword !== pw.confirm) return setPwState({ loading: false, error: 'New passwords do not match.', ok: '' });
    setPwState({ loading: true, error: '', ok: '' });
    try {
      await api('/api/account/password', { method: 'PUT', body: { currentPassword: pw.currentPassword, newPassword: pw.newPassword } });
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
      setPwState({ loading: false, error: '', ok: 'Password updated.' });
    } catch (err) {
      setPwState({ loading: false, error: err.message, ok: '' });
    }
  };

  return (
    <>
      <PageTitle title="Account Settings" />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Personal details">
          <form onSubmit={saveProfile} className="space-y-4">
            <Field label="Full name" required>
              <input required value={profile.name} onChange={(e) => setProfile({ name: e.target.value })} className={lightInput} autoComplete="name" />
            </Field>
            <Field label="Email" hint={user.emailVerified ? 'Verified' : 'Not verified yet'}>
              <input value={user.email} disabled className={lightInput} />
            </Field>
            <ErrorNote msg={pState.error} />
            <SuccessNote msg={pState.ok} />
            <button type="submit" disabled={pState.loading} className="btn-blue h-11 px-6 text-sm disabled:opacity-60">
              Save
            </button>
          </form>
        </Card>
        <Card title="Change password">
          <form onSubmit={changePassword} className="space-y-4">
            <Field label="Current password" required>
              <input required type="password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} className={lightInput} autoComplete="current-password" />
            </Field>
            <Field label="New password" required hint="At least 8 characters, including a letter and a number.">
              <input required type="password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} className={lightInput} autoComplete="new-password" />
            </Field>
            <Field label="Confirm new password" required>
              <input required type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} className={lightInput} autoComplete="new-password" />
            </Field>
            <ErrorNote msg={pwState.error} />
            <SuccessNote msg={pwState.ok} />
            <button type="submit" disabled={pwState.loading} className="btn-blue h-11 px-6 text-sm disabled:opacity-60">
              Update password
            </button>
          </form>
        </Card>
        <Card title="Session">
          <p className="text-sm text-slate-600">Member since {fmtDate(user.createdAt)}.</p>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="mt-4 inline-flex h-10 items-center gap-2 rounded border border-slate-300 px-5 text-sm font-semibold hover:border-navy-900"
          >
            Log out
          </button>
        </Card>
        <Card title="Need help?">
          <p className="text-sm text-slate-600">To change your account email or close your account, contact our team.</p>
          <Link to="/company/contact" className="link-blue mt-3">
            <FileText className="h-4 w-4" /> Contact us
          </Link>
        </Card>
      </div>
    </>
  );
}
