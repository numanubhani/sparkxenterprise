// Google Ads (gtag.js) conversion tracking. Does nothing until VITE_GOOGLE_ADS_ID is set.
const ADS_ID = (import.meta.env.VITE_GOOGLE_ADS_ID || '').trim(); // e.g. AW-123456789
const CONVERSION_LABEL = (import.meta.env.VITE_GOOGLE_ADS_CONVERSION_LABEL || '').trim();

let loaded = false;

export function initTracking() {
  if (loaded || !ADS_ID || typeof document === 'undefined') return;
  loaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments); // gtag.js requires the `arguments` object
  };
  window.gtag('js', new Date());
  window.gtag('config', ADS_ID);
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ADS_ID)}`;
  document.head.appendChild(s);
}

// Call once after the server confirms a quote request was saved.
export function trackQuoteConversion(requestId) {
  if (!ADS_ID || !CONVERSION_LABEL || typeof window.gtag !== 'function') return;
  window.gtag('event', 'conversion', {
    send_to: `${ADS_ID}/${CONVERSION_LABEL}`,
    transaction_id: requestId, // lets Google de-duplicate repeated reports
  });
}
