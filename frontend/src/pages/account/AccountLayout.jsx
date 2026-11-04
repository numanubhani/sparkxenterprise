import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Bookmark, Building2, FileText, LayoutDashboard, ListChecks, LogOut, MailWarning, Receipt, Settings, ShieldCheck, ShieldHalf } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../lib/api.js';
import { useDocumentTitle } from '../../lib/useDocumentTitle.js';

const LINKS = [
  { to: '/account', end: true, icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/account/requests', icon: ListChecks, label: 'My Requests' },
  { to: '/account/quotes', icon: Receipt, label: 'My Quotes' },
  { to: '/account/saved', icon: Bookmark, label: 'Saved Products' },
  { to: '/account/company', icon: Building2, label: 'Company Profile' },
  { to: '/account/kyb', icon: ShieldCheck, label: 'KYB & Compliance' },
  { to: '/account/settings', icon: Settings, label: 'Account Settings' },
];

export function VerifyBanner() {
  const { user } = useAuth();
  const [state, setState] = useState('');
  if (!user || user.emailVerified) return null;

  const resend = async () => {
    setState('sending');
    try {
      await api('/api/auth/resend-verification', { method: 'POST' });
      setState('sent');
    } catch (err) {
      setState(err.message);
    }
  };

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center">
      <MailWarning className="h-5 w-5 shrink-0" />
      <p className="flex-1">
        Please verify <b>{user.email}</b>. Verification links your earlier requests to this account and is required before submitting KYB information.
      </p>
      {state === 'sent' && <span className="font-semibold">Email sent — check your inbox and spam folder.</span>}
      <button type="button" onClick={resend} disabled={state === 'sending'} className="shrink-0 font-semibold text-amber-900 underline disabled:opacity-60">
        {state === 'sending' ? 'Sending…' : state === 'sent' ? 'Resend again' : 'Resend verification email'}
      </button>
      {state && !['sending', 'sent'].includes(state) && <span className="text-red-700">{state}</span>}
    </div>
  );
}

export default function AccountLayout() {
  useDocumentTitle('Your Account');
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] bg-[#f6f8fc] text-navy-900">
      <div className="container-site grid gap-8 py-8 lg:grid-cols-[250px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-3 border-b border-slate-100 px-2 pb-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand text-lg font-semibold text-white">{user.name.charAt(0).toUpperCase()}</span>
              <span className="min-w-0">
                <span className="block truncate font-semibold">{user.name}</span>
                <span className="block truncate text-xs text-slate-500">{user.company?.name || user.email}</span>
              </span>
            </div>
            <nav className="mt-3 flex gap-1 overflow-x-auto lg:flex-col" aria-label="Account">
              {LINKS.map(({ to, end, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex shrink-0 items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${isActive ? 'bg-brand/10 font-semibold text-brand' : 'text-slate-700 hover:bg-slate-50'}`
                  }
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.7} /> {label}
                </NavLink>
              ))}
              {isAdmin && (
                <NavLink to="/admin" className="flex shrink-0 items-center gap-3 rounded-md px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                  <ShieldHalf className="h-[18px] w-[18px]" strokeWidth={1.7} /> Admin Dashboard
                </NavLink>
              )}
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="flex shrink-0 items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                <LogOut className="h-[18px] w-[18px]" strokeWidth={1.7} /> Log out
              </button>
            </nav>
          </div>
          <Link to="/quote" className="mt-4 hidden items-center gap-3 rounded-xl bg-navy-900 p-4 text-sm text-white lg:flex">
            <FileText className="h-5 w-5 text-brand-sky" /> Start a new quote request
          </Link>
        </aside>

        <div className="min-w-0">
          <VerifyBanner />
          <Outlet />
        </div>
      </div>
    </div>
  );
}
