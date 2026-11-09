import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Menu, Search, ShoppingCart, User, X } from 'lucide-react';
import { NAV } from '../../data/nav.js';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

function Dropdown({ menu, open, onToggle, onOpen, onClose, active }) {
  return (
    <div className="relative" onMouseEnter={onOpen} onMouseLeave={onClose}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={onToggle}
        className={`flex items-center gap-1.5 py-7 text-[15px] font-medium transition-colors hover:text-brand-sky ${
          active ? 'text-brand-sky' : 'text-white'
        }`}
      >
        {menu.label}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-1/2 top-full z-50 w-[340px] -translate-x-1/2 rounded-lg border border-white/10 bg-navy-900/95 p-2 shadow-2xl shadow-black/50 backdrop-blur">
          {menu.items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className="block rounded-md px-4 py-3 transition-colors hover:bg-white/5 focus:bg-white/5 focus:outline-none"
            >
              <span className="block text-sm font-semibold text-white">{item.label}</span>
              <span className="mt-0.5 block text-xs text-slate-400">{item.desc}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState(null);
  const [query, setQuery] = useState('');
  const navRef = useRef(null);
  const { count } = useCart();
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Close menus on route change, outside click and Escape
  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onClick = (e) => navRef.current && !navRef.current.contains(e.target) && setOpenMenu(null);
    const onKey = (e) => e.key === 'Escape' && (setOpenMenu(null), setMobileOpen(false));
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const isSectionActive = (menu) => location.pathname.startsWith('/' + menu.to.split('/')[1].split('?')[0]);

  const onSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/products?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-navy-900">
      <div className="container-site flex h-[84px] items-center gap-6">
        <Link to="/" className="shrink-0" aria-label="SPARK X Technology home">
          <img src="/images/logo.png" alt="SPARK X Technology" className="h-[46px] w-auto" />
        </Link>

        <nav ref={navRef} className="ml-4 hidden items-center gap-8 xl:flex 2xl:ml-6 2xl:gap-9" aria-label="Main">
          {NAV.map((menu) => (
            <Dropdown
              key={menu.label}
              menu={menu}
              active={isSectionActive(menu)}
              open={openMenu === menu.label}
              onToggle={() => setOpenMenu((m) => (m === menu.label ? null : menu.label))}
              onOpen={() => setOpenMenu(menu.label)}
              onClose={() => setOpenMenu(null)}
            />
          ))}
          <NavLink
            to="/company/contact"
            className={({ isActive }) => `text-[15px] font-medium hover:text-brand-sky ${isActive ? 'text-brand-sky' : ''}`}
          >
            Contact
          </NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-5">
          <form onSubmit={onSearch} className="relative hidden lg:block">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-300" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search GPUs, servers, part numbers..."
              aria-label="Search products"
              className="h-[42px] w-[230px] rounded-[4px] border border-white/20 bg-white/[0.06] pl-11 pr-3 text-xs text-white placeholder:text-slate-400 focus:border-brand-sky focus:outline-none 2xl:w-[280px]"
            />
          </form>

          <Link to="/quote" className="btn-white hidden h-[42px] whitespace-nowrap px-5 text-[13px] sm:inline-flex">
            Request a Quote
          </Link>

          <Link
            to={user ? (isAdmin ? '/admin' : '/account') : '/login'}
            className="flex flex-col items-center gap-1 whitespace-nowrap text-[11px] font-medium hover:text-brand-sky"
            title={user ? user.email : 'Log in or create an account'}
          >
            {user ? (
              <span className="grid h-5 w-5 place-items-center rounded-full bg-brand text-[10px] font-bold">{user.name.charAt(0).toUpperCase()}</span>
            ) : (
              <User className="h-5 w-5" strokeWidth={1.7} />
            )}
            <span className="hidden sm:inline">{user ? (isAdmin ? 'Admin' : 'Account') : 'Log in'}</span>
          </Link>

          <Link to="/quote" className="relative flex flex-col items-center gap-1 text-[11px] font-medium hover:text-brand-sky">
            <ShoppingCart className="h-5 w-5" strokeWidth={1.7} />
            Cart
            {count > 0 && (
              <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-semibold">
                {count}
              </span>
            )}
          </Link>

          <button
            type="button"
            className="rounded p-1.5 hover:bg-white/10 xl:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="max-h-[calc(100vh-84px)] overflow-y-auto border-t border-white/10 bg-navy-900 xl:hidden">
          <div className="container-site py-4">
            <form onSubmit={onSearch} className="relative mb-4 lg:hidden">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search GPUs, servers, part numbers..."
                className="h-11 w-full rounded border border-white/20 bg-white/5 pl-10 pr-3 text-sm placeholder:text-slate-400 focus:outline-none"
              />
            </form>
            {NAV.map((menu) => (
              <div key={menu.label} className="border-b border-white/10">
                <button
                  type="button"
                  className="flex w-full items-center justify-between py-3.5 text-left font-medium"
                  aria-expanded={mobileSection === menu.label}
                  onClick={() => setMobileSection((s) => (s === menu.label ? null : menu.label))}
                >
                  {menu.label}
                  <ChevronDown className={`h-4 w-4 transition-transform ${mobileSection === menu.label ? 'rotate-180' : ''}`} />
                </button>
                {mobileSection === menu.label && (
                  <div className="pb-3">
                    {menu.items.map((item) => (
                      <Link key={item.to} to={item.to} className="block py-2 pl-3 text-sm text-slate-300 hover:text-white">
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link to="/company/contact" className="block border-b border-white/10 py-3.5 font-medium">
              Contact
            </Link>
            <Link to="/quote" className="btn-white mt-5 h-11 w-full text-sm sm:hidden">
              Request a Quote
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
