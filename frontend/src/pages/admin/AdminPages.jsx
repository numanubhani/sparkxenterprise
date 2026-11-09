import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Inbox, Lock, Plus, Search, Send, ShieldCheck, Trash2, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { TYPE_LABELS, fmtDate, fmtMoney, itemsSummary } from '../../lib/format.js';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { Card, Empty, ErrorNote, Field, Loading, PageTitle, SuccessNote, lightInput } from '../account/ui.jsx';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'AED'];
const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');
const toDateTimeInput = (d) => (d ? new Date(new Date(d).getTime() - new Date(d).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '');

function Pager({ page, pages, onPage }) {
  if (pages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-end gap-2 text-sm">
      <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)} className="grid h-8 w-8 place-items-center rounded border border-slate-300 bg-white disabled:opacity-40" aria-label="Previous page">
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span>
        Page {page} of {pages}
      </span>
      <button type="button" disabled={page >= pages} onClick={() => onPage(page + 1)} className="grid h-8 w-8 place-items-center rounded border border-slate-300 bg-white disabled:opacity-40" aria-label="Next page">
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// Keeps list filters in the URL so they survive navigation to a detail page and back
function useQueryState() {
  const [params, setParams] = useSearchParams();
  const get = (k) => params.get(k) || '';
  const set = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in patch)) next.delete('page');
    setParams(next, { replace: true });
  };
  return [get, set, params.toString()];
}

/* -------------------------------- Overview -------------------------------- */
export function AdminOverview() {
  const { data, loading, error } = useApi('/api/admin/stats');
  if (loading) return <Loading />;
  if (error) return <ErrorNote msg={error} />;

  const s = data.byStatus;
  const cards = [
    { label: 'New requests', value: s.New || 0, to: '/admin/requests?status=New', tone: 'text-sky-700' },
    { label: 'In progress', value: ['Qualification', 'Supplier RFQ', 'Compliance Review', 'Quote Prepared', 'Negotiation', 'Under Review', 'Supplier Pricing Requested'].reduce((n, k) => n + (s[k] || 0), 0), to: '/admin/requests', tone: 'text-amber-700' },
    { label: 'Quotes sent', value: s['Quote Sent'] || 0, to: '/admin/requests?status=Quote+Sent', tone: 'text-blue-700' },
    { label: 'Approved', value: s.Approved || 0, to: '/admin/requests?status=Approved', tone: 'text-emerald-700' },
    { label: 'Registered users', value: data.users, to: '/admin/users', tone: 'text-navy-900' },
    { label: 'KYB awaiting review', value: data.kybPending, to: '/admin/users?kyb=Submitted', tone: 'text-orange-700' },
  ];

  return (
    <>
      <PageTitle title="Overview" subtitle="Requests, quotes and customer verification at a glance." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md">
            <p className={`text-3xl font-bold ${c.tone}`}>{c.value}</p>
            <p className="mt-1 text-sm text-slate-500">{c.label}</p>
          </Link>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
        {Object.entries(TYPE_LABELS).map(([k, l]) => (
          <span key={k} className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
            {l.replace(/y$/, 'ie')}s: <b>{data.byType[k] || 0}</b>
          </span>
        ))}
      </div>
      <Card title="Latest requests" className="mt-6" action={<Link to="/admin/requests" className="link-blue">View all <ArrowRight className="h-4 w-4" /></Link>}>
        {data.recent.length ? (
          <ul className="divide-y divide-slate-100">
            {data.recent.map((r) => (
              <li key={r._id}>
                <Link to={`/admin/requests/${r._id}`} className="flex flex-wrap items-center justify-between gap-3 py-3 hover:bg-slate-50">
                  <span>
                    <span className="font-semibold text-brand">{r.requestId}</span>
                    <span className="ml-3 text-sm text-slate-600">
                      {r.fullName}
                      {r.company ? ` · ${r.company}` : ''}
                    </span>
                  </span>
                  <span className="flex items-center gap-3 text-xs text-slate-500">
                    {TYPE_LABELS[r.type]} · {fmtDate(r.createdAt)} <StatusBadge status={r.status} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-600">No requests yet.</p>
        )}
      </Card>
    </>
  );
}

/* ------------------------------ Requests list ------------------------------ */
export function AdminRequests() {
  const [get, set, qs] = useQueryState();
  const meta = useApi('/api/admin/meta');
  const { data, loading, error } = useApi(`/api/admin/requests?${qs}`);
  const [q, setQ] = useState(get('q'));
  const statuses = meta.data ? [...new Set(Object.values(meta.data.statuses).flat())] : [];

  return (
    <>
      <PageTitle title="Requests" subtitle="Quote requests, general inquiries and callback requests." />
      <div className="mb-4 flex flex-wrap gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            set({ q });
          }}
          className="relative min-w-[240px] flex-1"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ID, name, email, company, product…" className={`${lightInput} pl-9`} />
        </form>
        <select value={get('type')} onChange={(e) => set({ type: e.target.value })} className={`${lightInput} sm:!w-auto`}>
          <option value="">All types</option>
          {Object.entries(TYPE_LABELS).map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </select>
        <select value={get('status')} onChange={(e) => set({ status: e.target.value })} className={`${lightInput} sm:!w-auto`}>
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorNote msg={error} />
      ) : data.items.length ? (
        <>
          <p className="mb-2 text-sm text-slate-500">{data.total} request(s)</p>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  {['Request', 'Customer', 'Type', 'Items', 'Destination', 'Received', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link to={`/admin/requests/${r._id}`} className="font-semibold text-brand hover:underline">
                        {r.requestId}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="block font-medium">{r.fullName}</span>
                      <span className="block text-xs text-slate-500">{r.company || r.email}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {TYPE_LABELS[r.type]}
                      {r.user && <span className="ml-1.5 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-500">Account</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{itemsSummary(r.items)}</td>
                    <td className="px-4 py-3 text-slate-600">{r.country || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{fmtDate(r.createdAt)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager page={data.page} pages={data.pages} onPage={(p) => set({ page: String(p) })} />
        </>
      ) : (
        <Empty>
          <Inbox className="mx-auto mb-2 h-8 w-8 text-slate-400" /> No requests match these filters.
        </Empty>
      )}
    </>
  );
}

/* ----------------------------- Request detail ------------------------------ */
function initQuote(r) {
  const q = r.quote || {};
  return {
    currency: q.currency || 'USD',
    lines: q.lines?.length ? q.lines.map((l) => ({ ...l })) : r.items.length ? r.items.map((i) => ({ name: i.name, quantity: i.quantity, unitPrice: '' })) : [{ name: '', quantity: 1, unitPrice: '' }],
    leadTime: q.leadTime || '',
    validUntil: toDateInput(q.validUntil),
    terms: q.terms || '100% advance payment is required before the order is placed with the supplier.\nPrices exclude import duties and local taxes unless stated otherwise.',
    notes: q.notes || '',
  };
}

function initInternal(r) {
  return {
    status: r.status,
    exportScreening: r.exportScreening || 'Not started',
    supplierName: r.supplierName || '',
    supplierRef: r.supplierRef || '',
    supplierCost: { amount: r.supplierCost?.amount ?? '', currency: r.supplierCost?.currency || 'USD' },
    internalLeadTime: r.internalLeadTime || '',
    internalNotes: r.internalNotes || '',
    scheduledAt: toDateTimeInput(r.scheduledAt),
    followUpDate: toDateInput(r.followUpDate),
    commissionTerms: r.commissionTerms || '',
  };
}

export function AdminRequestDetail() {
  const { id } = useParams();
  const meta = useApi('/api/admin/meta');
  const { data: r, loading, error, setData } = useApi(`/api/admin/requests/${id}`);
  const [internal, setInternal] = useState(null);
  const [quote, setQuote] = useState(null);
  const [msg, setMsg] = useState({ error: '', ok: '' });
  const [busy, setBusy] = useState('');

  useEffect(() => {
    if (r) {
      setInternal(initInternal(r));
      setQuote(initQuote(r));
    }
  }, [r]);

  if (loading || !internal) return error ? <ErrorNote msg={error} /> : <Loading />;

  const listed = meta.data?.statuses[r.type] || [];
  const statuses = listed.includes(r.status) ? listed : [r.status, ...listed]; // keeps a legacy status selectable
  const total = quote.lines.reduce((s, l) => s + (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0), 0);
  const margin = internal.supplierCost.amount !== '' && total > 0 ? total - Number(internal.supplierCost.amount) : null;
  const quotable = r.type === 'quote' || r.type === 'inquiry';

  const save = async (extra = {}) => {
    setBusy('save');
    setMsg({ error: '', ok: '' });
    try {
      const body = { ...internal, ...(quotable ? { quote } : {}), ...extra };
      const updated = await api(`/api/admin/requests/${id}`, { method: 'PATCH', body });
      setData(updated);
      setMsg({ error: '', ok: 'Changes saved.' });
      return true;
    } catch (err) {
      setMsg({ error: err.message, ok: '' });
      return false;
    } finally {
      setBusy('');
    }
  };

  const sendQuote = async () => {
    if (!window.confirm(`Send this quote (${fmtMoney(total, quote.currency)}) to ${r.email}?`)) return;
    if (!(await save())) return;
    setBusy('send');
    try {
      const d = await api(`/api/admin/requests/${id}/send-quote`, { method: 'POST' });
      setData(d.request);
      setMsg({ error: '', ok: d.emailed ? `Quote sent to ${r.email}.` : 'Quote marked as sent, but the email could not be delivered (check SMTP settings). The customer can still see it in their account.' });
    } catch (err) {
      setMsg({ error: err.message, ok: '' });
    } finally {
      setBusy('');
    }
  };

  const setLine = (i, patch) => setQuote((q) => ({ ...q, lines: q.lines.map((l, j) => (j === i ? { ...l, ...patch } : l)) }));
  const setI = (k) => (e) => setInternal({ ...internal, [k]: e.target.value });

  return (
    <>
      <Link to="/admin/requests" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-navy-900">
        <ArrowLeft className="h-4 w-4" /> All requests
      </Link>
      <PageTitle title={r.requestId} subtitle={`${TYPE_LABELS[r.type]} · received ${fmtDate(r.createdAt, true)}`} action={<StatusBadge status={r.status} className="text-sm" />} />

      <div className="grid gap-6 2xl:grid-cols-[1.4fr_1fr]">
        <div className="min-w-0 space-y-6">
          <Card title="Customer request">
            <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              {[
                ['Name', r.fullName],
                ['Company', r.company],
                ['Email', <a key="e" href={`mailto:${r.email}`} className="text-brand hover:underline">{r.email}</a>],
                ['Phone', r.phone],
                ['Destination', r.country],
                ['End user', r.endUserOrg && `${r.endUserOrg}${r.endUserCountry ? ` (${r.endUserCountry})` : ''}`],
                ['Inquiry type', r.inquiryType],
                ['Target delivery', r.targetDeliveryDate && fmtDate(r.targetDeliveryDate)],
                ['Account', r.user ? <Link key="u" to={`/admin/users/${r.user._id}`} className="text-brand hover:underline">{r.user.name} — KYB: {r.user.kyb?.status || 'Not started'}</Link> : 'Guest'],
              ]
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className="flex flex-wrap justify-between gap-x-4 gap-y-0.5 border-b border-slate-100 py-1.5">
                    <dt className="shrink-0 text-slate-500">{k}</dt>
                    <dd className="min-w-0 break-words text-right font-medium">{v}</dd>
                  </div>
                ))}
            </dl>
            {r.items.length > 0 && (
              <ul className="mt-5 divide-y divide-slate-100 rounded-lg border border-slate-200">
                {r.items.map((it, i) => (
                  <li key={i} className="flex justify-between gap-4 px-4 py-2.5 text-sm">
                    <span>
                      <span className="font-medium">{it.name}</span>
                      {it.note && <span className="block text-slate-500">Note: {it.note}</span>}
                    </span>
                    <span className="shrink-0">× {it.quantity}</span>
                  </li>
                ))}
              </ul>
            )}
            {r.message && <p className="mt-4 whitespace-pre-line rounded bg-slate-50 p-4 text-sm text-slate-700">{r.message}</p>}
          </Card>

          {quotable && (
            <Card
              title="Customer quotation"
              action={r.quote?.sentAt ? <span className="text-xs text-slate-500">Last sent {fmtDate(r.quote.sentAt, true)}</span> : <span className="text-xs text-slate-500">Draft — not visible to customer</span>}
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="pb-2">Item</th>
                      <th className="w-24 pb-2">Qty</th>
                      <th className="w-36 pb-2">Unit price</th>
                      <th className="w-32 pb-2 text-right">Line total</th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {quote.lines.map((l, i) => (
                      <tr key={i}>
                        <td className="py-1 pr-2">
                          <input value={l.name} onChange={(e) => setLine(i, { name: e.target.value })} className={`${lightInput} h-9`} placeholder="Item description" />
                        </td>
                        <td className="py-1 pr-2">
                          <input type="number" min="1" value={l.quantity} onChange={(e) => setLine(i, { quantity: e.target.value })} className={`${lightInput} h-9`} />
                        </td>
                        <td className="py-1 pr-2">
                          <input type="number" min="0" step="0.01" value={l.unitPrice} onChange={(e) => setLine(i, { unitPrice: e.target.value })} className={`${lightInput} h-9`} placeholder="0.00" />
                        </td>
                        <td className="py-1 text-right">{fmtMoney((Number(l.quantity) || 0) * (Number(l.unitPrice) || 0), quote.currency)}</td>
                        <td className="py-1 text-right">
                          <button type="button" onClick={() => setQuote({ ...quote, lines: quote.lines.filter((_, j) => j !== i) })} aria-label="Remove line" className="p-1.5 text-slate-400 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                <button type="button" onClick={() => setQuote({ ...quote, lines: [...quote.lines, { name: '', quantity: 1, unitPrice: '' }] })} className="link-blue">
                  <Plus className="h-4 w-4" /> Add line
                </button>
                <p className="text-lg font-bold">Total: {fmtMoney(total, quote.currency)}</p>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <Field label="Currency">
                  <select value={quote.currency} onChange={(e) => setQuote({ ...quote, currency: e.target.value })} className={lightInput}>
                    {CURRENCIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Lead time (customer-facing)">
                  <input value={quote.leadTime} onChange={(e) => setQuote({ ...quote, leadTime: e.target.value })} className={lightInput} placeholder="e.g. 8–10 weeks after payment" />
                </Field>
                <Field label="Valid until">
                  <input type="date" value={quote.validUntil} onChange={(e) => setQuote({ ...quote, validUntil: e.target.value })} className={lightInput} />
                </Field>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Terms">
                  <textarea rows={4} value={quote.terms} onChange={(e) => setQuote({ ...quote, terms: e.target.value })} className={`${lightInput} h-auto py-2.5`} />
                </Field>
                <Field label="Message to customer">
                  <textarea rows={4} value={quote.notes} onChange={(e) => setQuote({ ...quote, notes: e.target.value })} className={`${lightInput} h-auto py-2.5`} />
                </Field>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <button type="button" onClick={sendQuote} disabled={!!busy || total <= 0 || r.status === 'Approved'} className="btn-blue h-11 px-6 text-sm disabled:opacity-50">
                  <Send className="h-4 w-4" /> {busy === 'send' ? 'Sending…' : r.quote?.sentAt ? 'Save & resend quote' : 'Save & send quote'}
                </button>
                <p className="self-center text-xs text-slate-500">
                  {r.status === 'Approved' ? 'The customer has approved this quote — it can no longer be resent.' : 'Sending emails the customer and sets the status to “Quote Sent”.'}
                </p>
              </div>
            </Card>
          )}
        </div>

        <div className="min-w-0 space-y-6">
          <Card title="Workflow">
            <div className="space-y-4">
              <Field label="Status">
                <select value={internal.status} onChange={setI('status')} className={lightInput}>
                  {statuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              {r.type === 'callback' && (
                <Field label="Scheduled call (your local time)">
                  <input type="datetime-local" value={internal.scheduledAt} onChange={setI('scheduledAt')} className={lightInput} />
                </Field>
              )}
              <Field label="Follow-up date">
                <input type="date" value={internal.followUpDate} onChange={setI('followUpDate')} className={lightInput} />
              </Field>
              <Field label="Export screening">
                <select value={internal.exportScreening} onChange={setI('exportScreening')} className={lightInput}>
                  {['Not started', 'In progress', 'Cleared', 'Flagged'].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
            </div>
          </Card>

          <Card title={<span className="flex items-center gap-2"><Lock className="h-4 w-4 text-slate-400" /> Internal (hidden from customer)</span>}>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Supplier">
                  <input value={internal.supplierName} onChange={setI('supplierName')} className={lightInput} />
                </Field>
                <Field label="Supplier quote ref.">
                  <input value={internal.supplierRef} onChange={setI('supplierRef')} className={lightInput} />
                </Field>
              </div>
              <div className="grid grid-cols-[1fr_96px] gap-2">
                <Field label="Supplier cost (total)">
                  <input type="number" min="0" step="0.01" value={internal.supplierCost.amount} onChange={(e) => setInternal({ ...internal, supplierCost: { ...internal.supplierCost, amount: e.target.value } })} className={lightInput} />
                </Field>
                <Field label="Currency">
                  <select value={internal.supplierCost.currency} onChange={(e) => setInternal({ ...internal, supplierCost: { ...internal.supplierCost, currency: e.target.value } })} className={lightInput}>
                    {CURRENCIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
              </div>
              {margin !== null && internal.supplierCost.currency === quote.currency && (
                <p className={`text-sm font-semibold ${margin >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  Margin: {fmtMoney(margin, quote.currency)} ({((margin / total) * 100).toFixed(1)}%)
                </p>
              )}
              <Field label="Supplier lead time (internal)">
                <input value={internal.internalLeadTime} onChange={setI('internalLeadTime')} className={lightInput} placeholder="As confirmed by supplier, incl. date" />
              </Field>
              <Field label="Broker commission terms">
                <textarea rows={2} value={internal.commissionTerms} onChange={setI('commissionTerms')} className={`${lightInput} h-auto py-2.5`} />
              </Field>
              <Field label="Internal notes">
                <textarea rows={5} value={internal.internalNotes} onChange={setI('internalNotes')} className={`${lightInput} h-auto py-2.5`} />
              </Field>
            </div>
          </Card>

          <div className="sticky bottom-4 space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
            <ErrorNote msg={msg.error} />
            <SuccessNote msg={msg.ok} />
            <button type="button" onClick={() => save()} disabled={!!busy} className="btn-blue h-11 w-full text-sm disabled:opacity-50">
              {busy === 'save' ? 'Saving…' : 'Save changes'}
            </button>
          </div>

          <Card title="History">
            <ol className="space-y-3">
              {r.statusHistory.map((h, i) => (
                <li key={i} className="flex justify-between gap-3 text-sm">
                  <span className="font-medium">{h.status}</span>
                  <span className="text-right text-xs text-slate-500">
                    {fmtDate(h.at, true)}
                    <br />
                    {h.by}
                  </span>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </>
  );
}

/* --------------------------------- Users ---------------------------------- */
export function AdminUsers() {
  const [get, set, qs] = useQueryState();
  const meta = useApi('/api/admin/meta');
  const { data, loading, error } = useApi(`/api/admin/users?${qs}`);
  const [q, setQ] = useState(get('q'));

  return (
    <>
      <PageTitle title="Users & KYB" subtitle="Registered customers, their company details and verification status." />
      <div className="mb-4 flex flex-wrap gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            set({ q });
          }}
          className="relative min-w-[240px] flex-1"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, company…" className={`${lightInput} pl-9`} />
        </form>
        <select value={get('kyb')} onChange={(e) => set({ kyb: e.target.value })} className={`${lightInput} sm:!w-auto`}>
          <option value="">All KYB statuses</option>
          {(meta.data?.kybStatuses || []).map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select value={get('role')} onChange={(e) => set({ role: e.target.value })} className={`${lightInput} sm:!w-auto`}>
          <option value="">All roles</option>
          <option value="customer">Customers</option>
          <option value="admin">Admins</option>
        </select>
      </div>
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorNote msg={error} />
      ) : data.items.length ? (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  {['User', 'Company', 'Country', 'Requests', 'KYB', 'Joined'].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link to={`/admin/users/${u.id}`} className="font-semibold text-brand hover:underline">
                        {u.name}
                      </Link>
                      {u.role === 'admin' && <span className="ml-2 rounded bg-navy-900 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">Admin</span>}
                      <span className="block text-xs text-slate-500">
                        {u.email} {!u.emailVerified && <span className="text-amber-700">· unverified</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{u.company?.name || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{u.company?.country || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{u.requestCount}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={u.kyb?.status || 'Not started'} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">{fmtDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager page={data.page} pages={data.pages} onPage={(p) => set({ page: String(p) })} />
        </>
      ) : (
        <Empty>
          <Users className="mx-auto mb-2 h-8 w-8 text-slate-400" /> No users match these filters.
        </Empty>
      )}
    </>
  );
}

export function AdminUserDetail() {
  const { id } = useParams();
  const { user: me } = useAuth();
  const meta = useApi('/api/admin/meta');
  const { data, loading, error, setData } = useApi(`/api/admin/users/${id}`);
  const [review, setReview] = useState(null);
  const [msg, setMsg] = useState({ error: '', ok: '' });

  useEffect(() => {
    if (data) setReview({ kybStatus: data.user.kyb?.status || 'Not started', kybReviewNote: data.user.kyb?.reviewNote || '' });
  }, [data]);

  if (loading || !review) return error ? <ErrorNote msg={error} /> : <Loading />;
  const { user: u, requests } = data;
  const kyb = u.kyb || {};

  const patch = async (body, ok) => {
    setMsg({ error: '', ok: '' });
    try {
      const d = await api(`/api/admin/users/${id}`, { method: 'PATCH', body });
      setData({ ...data, user: d.user });
      setMsg({ error: '', ok });
    } catch (err) {
      setMsg({ error: err.message, ok: '' });
    }
  };

  const rows = (pairs) =>
    pairs.map(([k, v]) => (
      <div key={k} className="flex justify-between gap-4 border-b border-slate-100 py-1.5 text-sm">
        <dt className="text-slate-500">{k}</dt>
        <dd className="text-right font-medium">{v || '—'}</dd>
      </div>
    ));

  return (
    <>
      <Link to="/admin/users" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-navy-900">
        <ArrowLeft className="h-4 w-4" /> All users
      </Link>
      <PageTitle
        title={u.name}
        subtitle={`${u.email} · ${u.emailVerified ? 'email verified' : 'email not verified'} · joined ${fmtDate(u.createdAt)}${u.lastLoginAt ? ` · last login ${fmtDate(u.lastLoginAt, true)}` : ''}`}
        action={<StatusBadge status={kyb.status || 'Not started'} className="text-sm" />}
      />
      <div className="mb-4 space-y-2">
        <ErrorNote msg={msg.error} />
        <SuccessNote msg={msg.ok} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Company profile">
          <dl>
            {rows([
              ['Legal name', u.company?.name],
              ['Registration no.', u.company?.registrationNumber],
              ['Country', u.company?.country],
              ['Address', u.company?.address],
              ['Website', u.company?.website],
              ['Job title', u.company?.jobTitle],
              ['Phone', u.phone],
            ])}
          </dl>
        </Card>

        <Card title={<span className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-brand" /> KYB information</span>}>
          {kyb.submittedAt ? (
            <dl>
              {rows([
                ['End user', kyb.endUser],
                ['Intended use', kyb.intendedUse],
                ['Installation country', kyb.installationCountry],
                ['Installation address', kyb.installationAddress],
                ['Third-party transfer', kyb.thirdPartyTransfer],
                ['Different payer / receiver', kyb.payerDifferent ? 'Yes' : 'No'],
                ['Additional info', kyb.notes],
                ['Submitted', fmtDate(kyb.submittedAt, true)],
              ])}
            </dl>
          ) : (
            <p className="text-sm text-slate-600">The customer hasn’t submitted KYB information yet.</p>
          )}
          <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
            <Field label="Review decision">
              <select value={review.kybStatus} onChange={(e) => setReview({ ...review, kybStatus: e.target.value })} className={lightInput}>
                {(meta.data?.kybStatuses || []).map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Note to customer" hint="Shown in the customer’s KYB page and included in the status email.">
              <textarea rows={3} value={review.kybReviewNote} onChange={(e) => setReview({ ...review, kybReviewNote: e.target.value })} className={`${lightInput} h-auto py-2.5`} />
            </Field>
            <button type="button" onClick={() => patch(review, 'KYB review saved.')} className="btn-blue h-10 px-5 text-sm">
              Save review
            </button>
            <p className="text-xs text-slate-500">Record screening results and any license decisions in the request’s internal notes. “Approved” does not replace a required export license.</p>
          </div>
        </Card>

        <Card title="Requests">
          {requests.length ? (
            <ul className="divide-y divide-slate-100">
              {requests.map((r) => (
                <li key={r._id}>
                  <Link to={`/admin/requests/${r._id}`} className="flex items-center justify-between gap-3 py-2.5 text-sm hover:bg-slate-50">
                    <span>
                      <span className="font-semibold text-brand">{r.requestId}</span>
                      <span className="ml-2 text-slate-500">{TYPE_LABELS[r.type]}</span>
                    </span>
                    <span className="flex items-center gap-3 text-xs text-slate-500">
                      {r.quote?.total ? fmtMoney(r.quote.total, r.quote.currency) : ''} {fmtDate(r.createdAt)} <StatusBadge status={r.status} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-600">No requests linked to this account.</p>
          )}
        </Card>

        <Card title="Access">
          <p className="text-sm text-slate-600">
            Role: <b className="capitalize">{u.role}</b>
          </p>
          {String(u.id) === String(me.id) ? (
            <p className="mt-3 text-xs text-slate-500">You can’t change your own role.</p>
          ) : (
            <button
              type="button"
              onClick={() => {
                const role = u.role === 'admin' ? 'customer' : 'admin';
                if (window.confirm(role === 'admin' ? `Give ${u.email} full admin access?` : `Remove admin access from ${u.email}?`)) patch({ role }, 'Role updated.');
              }}
              className="mt-3 inline-flex h-10 items-center rounded border border-slate-300 px-5 text-sm font-semibold hover:border-navy-900"
            >
              {u.role === 'admin' ? 'Remove admin access' : 'Make admin'}
            </button>
          )}
        </Card>
      </div>
    </>
  );
}
