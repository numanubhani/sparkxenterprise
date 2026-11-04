import { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import TopBar from './TopBar.jsx';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import { useCart } from '../../context/CartContext.jsx';

export default function Layout() {
  const { pathname } = useLocation();
  const { toast } = useCart();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {toast && (
        <div role="status" className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg bg-navy-800 px-5 py-3 text-sm shadow-2xl ring-1 ring-white/10">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-sky" />
          <span>{toast}</span>
          <Link to="/quote" className="font-semibold text-brand-sky hover:text-white">
            View cart
          </Link>
        </div>
      )}
    </div>
  );
}
