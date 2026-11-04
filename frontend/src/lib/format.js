export const fmtDate = (d, withTime = false) =>
  d
    ? new Date(d).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
      })
    : '—';

export const fmtMoney = (n, currency = 'USD') => {
  if (n === undefined || n === null || n === '') return '—';
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n);
  } catch {
    return `${currency} ${Number(n).toFixed(2)}`;
  }
};

export const TYPE_LABELS = { quote: 'Quote Request', inquiry: 'General Inquiry', callback: 'Callback Request' };

export const itemsSummary = (items = []) =>
  items.length ? `${items[0].name}${items.length > 1 ? ` + ${items.length - 1} more` : ''}` : '—';
