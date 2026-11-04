import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardList, MapPin, Search, ShieldCheck, ShieldHalf } from 'lucide-react';

const CHECKS = [
  { icon: ClipboardList, title: 'Company Verification', text: 'Business registration and ownership details.' },
  { icon: Search, title: 'End-User Information', text: 'Intended use and application.' },
  { icon: MapPin, title: 'Installation Location', text: 'Physical location where equipment will be installed.' },
  { icon: ShieldHalf, title: 'Export-Control Checks', text: 'Applicable regulatory and compliance review.' },
];

export default function Compliance() {
  return (
    <section className="bg-light-50 text-navy-900">
      <div className="container-site grid gap-8 py-10 lg:grid-cols-[auto_1fr] lg:items-center">
        <div className="flex items-center gap-5">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-brand/10">
            <ShieldCheck className="h-9 w-9 text-brand" strokeWidth={1.4} />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-medium text-[#0b1f44]">Secure, Transparent Procurement</h2>
            <Link to="/company/compliance-kyb" className="btn-blue mt-3 h-9 px-4 text-xs">
              Learn About Compliance <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <p className="text-[13px] leading-relaxed text-slate-500 lg:border-l lg:border-slate-200 lg:pl-6">
          High-technology orders may require company verification, end-user information, intended use, physical installation location and
          applicable export-control checks. Requirements vary by product, destination and transaction.
        </p>

        <ul className="grid gap-6 border-t border-slate-200 pt-7 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-4">
          {CHECKS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-3 lg:border-l lg:border-slate-200 lg:pl-5 lg:first:border-l-0 lg:first:pl-0">
              <Icon className="mt-0.5 h-6 w-6 shrink-0 text-brand" strokeWidth={1.5} />
              <div>
                <h3 className="text-[13px] font-semibold">{title}</h3>
                <p className="mt-1 text-xs leading-snug text-slate-500">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
