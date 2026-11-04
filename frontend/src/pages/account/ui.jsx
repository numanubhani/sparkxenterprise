// Shared bits for the account and admin areas (light theme).
import { Loader2 } from 'lucide-react';

export const lightInput =
  'h-11 w-full rounded-[4px] border border-slate-300 bg-white px-3.5 text-sm text-navy-900 placeholder:text-slate-400 focus:border-brand focus:outline-none disabled:bg-slate-50 disabled:text-slate-500';

export function PageTitle({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[28px] font-bold leading-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ title, children, className = '', action }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Field({ label, hint, children, required }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-slate-700">
        {label} {required && '*'}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

export function Loading() {
  return (
    <div className="grid place-items-center py-16">
      <Loader2 className="h-7 w-7 animate-spin text-brand" />
    </div>
  );
}

export function ErrorNote({ msg }) {
  return msg ? <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{msg}</p> : null;
}

export function SuccessNote({ msg }) {
  return msg ? <p className="rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{msg}</p> : null;
}

export function Empty({ children }) {
  return <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-600">{children}</div>;
}
