import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { FOOTER_COLS } from '../../data/nav.js';
import { PUBLIC_EMAIL } from '../../lib/site.js';

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-slate-300">
      <div className="container-site grid gap-10 py-14 lg:grid-cols-[1.2fr_2.8fr]">
        <div>
          <img src="/images/logo.png" alt="SPARK X Technology" className="h-11 w-auto" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed">
            Global sourcing of AI GPUs, servers and data center infrastructure. Supporting businesses worldwide.
          </p>
          <a href={`mailto:${PUBLIC_EMAIL}`} className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-white hover:text-brand-sky">
            <Mail className="h-4 w-4" /> {PUBLIC_EMAIL}
          </a>
        </div>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-white">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-[13px] hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-site flex flex-col gap-2 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} SPARK X Technology. All rights reserved.</p>
          <p>Product names and logos are trademarks of their respective owners.</p>
        </div>
      </div>
    </footer>
  );
}
