import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

function Spinner() {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <Loader2 className="h-8 w-8 animate-spin text-brand-sky" />
    </div>
  );
}

export function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  return <Outlet />;
}

export function RequireAdmin() {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  if (!isAdmin) return <Navigate to="/account" replace />;
  return <Outlet />;
}

// For login/register pages: logged-in users go straight to their destination
export function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  const next = new URLSearchParams(window.location.search).get('next');
  if (loading) return <Spinner />;
  if (user) return <Navigate to={next && next.startsWith('/') ? next : user.role === 'admin' ? '/admin' : '/account'} replace />;
  return children;
}
