import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ExternalLink, Inbox, LayoutDashboard, LogOut, Menu, MessageSquare, Package, Users, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../lib/api.js';
import { useDocumentTitle } from '../../lib/useDocumentTitle.js';

const LINKS = [
  { to: '/admin', end: true, icon: LayoutDashboard, label: 'Overview' },
  { to: '/admin/requests', icon: Inbox, label: 'Requests' },
  { to: '/admin/chats', icon: MessageSquare, label: 'Live chat', badge: true },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/users', icon: Users, label: 'Users & KYB' },
];

export default function AdminLayout() {
  useDocumentTitle('Admin Dashboard');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  // Number of chats waiting for a reply
  useEffect(() => {
    let stop = false;
    const load = () => api('/api/admin/chat-unread').then((d) => !stop && setUnread(d.count)).catch(() => {});
    load();
    const t = setInterval(() => !document.hidden && load(), 30000);
    return () => {
      stop = true;
      clearInterval(t);
    };
  }, []);

  const nav = (
    <nav className="space-y-1" aria-label="Admin">
      {LINKS.map(({ to, end, icon: Icon, label, badge }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={() => setOpen(false)}
          className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm ${isActive ? 'bg-brand text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
        >
          <Icon className="h-[18px] w-[18px]" /> {label}
          {badge && unread > 0 && <span className="ml-auto grid h-5 min-w-[20px] place-items-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">{unread}</span>}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-navy-900 lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="hidden flex-col bg-navy-900 p-5 text-white lg:sticky lg:top-0 lg:flex lg:h-screen">
        <Link to="/" className="mb-8 block">
          <img src="/images/logo.png" alt="SPARK X Technology" className="h-9 w-auto" />
        </Link>
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Admin</p>
        {nav}
        <div className="mt-auto space-y-1 border-t border-white/10 pt-4 text-sm">
          <Link to="/" className="flex items-center gap-3 rounded-md px-3 py-2 text-slate-300 hover:text-white">
            <ExternalLink className="h-4 w-4" /> View website
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-slate-300 hover:text-white"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
          <p className="truncate px-3 pt-2 text-xs text-slate-500">{user.email}</p>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex items-center justify-between bg-navy-900 px-4 py-3 text-white lg:hidden">
        <Link to="/">
          <img src="/images/logo.png" alt="SPARK X Technology" className="h-8 w-auto" />
        </Link>
        <button type="button" onClick={() => setOpen((o) => !o)} aria-label="Toggle admin menu" className="p-1.5">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && <div className="bg-navy-900 px-4 pb-4 lg:hidden">{nav}</div>}

      <main className="min-w-0 p-4 sm:p-8">
        <Outlet />
      </main>
    </div>
  );
}
