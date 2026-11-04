// Lead-time kinds (spec §4). Missing supplier data is never turned into an invented estimate.
export const LEAD_KINDS = {
  confirmed: { label: 'Supplier-confirmed delivery date' },
  range: { label: 'Supplier-provided lead-time range' },
  eta: { label: 'Ordered — estimated arrival' },
  'needs-confirmation': { label: 'Lead time requires confirmation' },
  'quote-only': { label: 'Quote-only product' },
};

export function fmtLeadSource(lt) {
  const bits = [];
  if (lt?.source) bits.push(`Source: ${lt.source}`);
  if (lt?.updatedAt) bits.push(`updated ${new Date(lt.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`);
  return bits.length ? `(${bits.join(', ')})` : '';
}
