const STYLES = {
  New: 'bg-sky-100 text-sky-800',
  'Under Review': 'bg-amber-100 text-amber-800',
  'Supplier Pricing Requested': 'bg-violet-100 text-violet-800',
  'Quote Sent': 'bg-blue-100 text-blue-800',
  Approved: 'bg-emerald-100 text-emerald-800',
  Qualification: 'bg-amber-100 text-amber-800',
  'Supplier RFQ': 'bg-violet-100 text-violet-800',
  'Compliance Review': 'bg-orange-100 text-orange-800',
  'Quote Prepared': 'bg-indigo-100 text-indigo-800',
  Negotiation: 'bg-cyan-100 text-cyan-800',
  Won: 'bg-emerald-200 text-emerald-900',
  Lost: 'bg-red-100 text-red-800',
  Closed: 'bg-slate-200 text-slate-700',
  Contacted: 'bg-amber-100 text-amber-800',
  Scheduled: 'bg-blue-100 text-blue-800',
  Completed: 'bg-emerald-100 text-emerald-800',
  // KYB
  'Not started': 'bg-slate-200 text-slate-700',
  Submitted: 'bg-amber-100 text-amber-800',
  'Additional Information Required': 'bg-orange-100 text-orange-800',
  'On Hold / Declined': 'bg-red-100 text-red-800',
  // Export screening
  'In progress': 'bg-amber-100 text-amber-800',
  Cleared: 'bg-emerald-100 text-emerald-800',
  Flagged: 'bg-red-100 text-red-800',
};

export default function StatusBadge({ status, className = '' }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLES[status] || 'bg-slate-100 text-slate-700'} ${className}`}>
      {status}
    </span>
  );
}
