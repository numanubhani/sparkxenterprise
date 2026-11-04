// Public site settings. Set these in frontend/.env (and in Vercel project env vars).
export const PUBLIC_EMAIL = import.meta.env.VITE_PUBLIC_EMAIL || 'info@sparkxtechnology.com';
// Calendly (or similar) booking link. Leave empty until the calendar is connected to real availability.
export const CALENDLY_URL = import.meta.env.VITE_CALENDLY_URL || '';
