import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

// items: [{ label, to? }] — the last item is the current page
export default function Breadcrumb({ items, light = false }) {
  return (
    <nav aria-label="Breadcrumb" className={`flex flex-wrap items-center gap-2 text-[13px] ${light ? 'text-slate-500' : 'text-slate-300'}`}>
      <Link to="/" className={light ? 'hover:text-navy-900' : 'hover:text-white'}>
        Home
      </Link>
      {items.map((item) => (
        <Fragment key={item.label}>
          <ChevronRight className="h-3.5 w-3.5" />
          {item.to ? (
            <Link to={item.to} className={light ? 'hover:text-navy-900' : 'hover:text-white'}>
              {item.label}
            </Link>
          ) : (
            <span className={light ? 'text-navy-900' : 'text-white'} aria-current="page">
              {item.label}
            </span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
