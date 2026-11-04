import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlertCircle, ArrowRight, Check, ChevronDown } from 'lucide-react';
import PageHero from '../components/ui/PageHero.jsx';
import CtaSection from '../components/ui/CtaSection.jsx';
import { getIcon } from '../components/ui/icons.js';
import InquiryForm from '../components/forms/InquiryForm.jsx';
import NotFound from './NotFound.jsx';
import { PAGES } from '../data/pages.js';
import { NAV } from '../data/nav.js';
import { useDocumentTitle } from '../lib/useDocumentTitle.js';

function Heading({ eyebrow, title, intro, center }) {
  return (
    <div className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-3xl'}>
      {eyebrow && <p className="eyebrow text-slate-500">{eyebrow}</p>}
      {title && <h2 className="mt-2 font-serif text-[30px] font-medium leading-tight text-[#0b1f44] sm:text-[34px]">{title}</h2>}
      {intro && <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{intro}</p>}
    </div>
  );
}

function Split({ s }) {
  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
      <div>
        <Heading eyebrow={s.eyebrow} title={s.title} />
        {s.body.map((p) => (
          <p key={p.slice(0, 40)} className="mt-4 text-[15px] leading-relaxed text-slate-600">
            {p}
          </p>
        ))}
      </div>
      {s.bullets && (
        <div className="rounded-xl border border-slate-200 bg-light p-7">
          {s.bulletsTitle && <h3 className="text-base font-semibold">{s.bulletsTitle}</h3>}
          <ul className="mt-4 space-y-3">
            {s.bullets.map((b) => (
              <li key={b} className="flex gap-3 text-[15px] text-slate-700">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand" /> {b}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Cards({ s }) {
  return (
    <>
      <Heading eyebrow={s.eyebrow} title={s.title} intro={s.intro} />
      <div className={`mt-8 grid gap-4 sm:grid-cols-2 ${s.items.length % 3 === 0 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
        {s.items.map((it) => {
          const Icon = getIcon(it.icon);
          const inner = (
            <>
              <Icon className="h-8 w-8 text-brand" strokeWidth={1.4} />
              <h3 className="mt-4 text-[15px] font-semibold">{it.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{it.text}</p>
              {it.to && (
                <span className="link-blue mt-4 text-[13px]">
                  {it.cta || 'Learn More'} <ArrowRight className="h-3.5 w-3.5" />
                </span>
              )}
            </>
          );
          const cls = 'flex flex-col rounded-md border border-slate-200 bg-white p-6 shadow-sm';
          return it.to ? (
            <Link key={it.title} to={it.to} className={`${cls} transition-shadow hover:shadow-lg`}>
              {inner}
            </Link>
          ) : (
            <div key={it.title} className={cls}>
              {inner}
            </div>
          );
        })}
      </div>
    </>
  );
}

function Steps({ s }) {
  return (
    <>
      <Heading eyebrow={s.eyebrow} title={s.title} intro={s.intro} />
      <ol className="mt-8 grid gap-4 md:grid-cols-2">
        {s.items.map((it, i) => (
          <li key={it.title} className="flex gap-5 rounded-md border border-slate-200 bg-white p-6">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-sm font-semibold text-white">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <h3 className="text-base font-semibold">{it.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{it.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}

function Faq({ s }) {
  const [open, setOpen] = useState(0);
  return (
    <>
      <Heading eyebrow={s.eyebrow} title={s.title} intro={s.intro} />
      <div className="mt-8 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
        {s.items.map((it, i) => (
          <div key={it.q}>
            <button
              type="button"
              aria-expanded={open === i}
              onClick={() => setOpen(open === i ? -1 : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-[15px] font-semibold hover:text-brand"
            >
              {it.q}
              <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${open === i ? 'rotate-180 text-brand' : 'text-slate-400'}`} />
            </button>
            {open === i && <p className="px-6 pb-5 text-[15px] leading-relaxed text-slate-600">{it.a}</p>}
          </div>
        ))}
      </div>
    </>
  );
}

function Note({ s }) {
  return (
    <div className="flex gap-4 rounded-xl border border-brand/25 bg-brand/5 p-6">
      <AlertCircle className="h-6 w-6 shrink-0 text-brand" />
      <div>
        <h3 className="font-semibold">{s.title}</h3>
        <p className="mt-1.5 text-[15px] leading-relaxed text-slate-700">{s.text}</p>
        {s.link && (
          <Link to={s.link.to} className="link-blue mt-3">
            {s.link.label} <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}

function FormSection() {
  return (
    <div className="mx-auto max-w-3xl">
      <InquiryForm
        title="Submit your sourcing requirements"
        intro="Include part numbers, quantities, configuration details, destination country and target timeline — the more detail, the faster we can respond."
        messagePlaceholder="e.g. 64x NVIDIA H200 SXM in 8-GPU servers, InfiniBand NDR, delivery to Frankfurt in Q3…"
      />
    </div>
  );
}

const RENDERERS = { split: Split, cards: Cards, steps: Steps, faq: Faq, note: Note, form: FormSection };

function sectionLabel(pathname) {
  const menu = NAV.find((m) => m.items.some((i) => i.to === pathname));
  return menu ? { label: menu.label, to: menu.items[0].to } : null;
}

export default function ContentPage() {
  const { pathname } = useLocation();
  const page = PAGES[pathname.replace(/\/$/, '')];
  useDocumentTitle(page?.metaTitle, page?.description);

  if (!page) return <NotFound />;

  const parent = sectionLabel(pathname);
  const crumbs = [...(parent ? [parent] : []), { label: page.crumb }];

  return (
    <>
      <PageHero crumbs={crumbs} {...page.hero} />
      <div className="bg-light-50 text-navy-900">
        {page.sections.map((s, i) => {
          const Comp = RENDERERS[s.type];
          return (
            <section key={i} className={i % 2 ? 'bg-white' : ''}>
              <div className="container-site py-12">
                <Comp s={s} />
              </div>
            </section>
          );
        })}
        <section className="bg-white">
          <div className="container-site flex flex-col items-start justify-between gap-5 border-t border-slate-200 py-8 sm:flex-row sm:items-center">
            <p className="text-[15px] text-slate-600">Looking for specific hardware? Browse the catalog or tell us your requirements.</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/products" className="inline-flex h-11 items-center gap-2 rounded border border-brand px-5 text-sm font-semibold text-brand hover:bg-brand hover:text-white">
                Products Catalog <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/company/contact" className="inline-flex h-11 items-center rounded border border-slate-300 px-5 text-sm font-semibold hover:border-navy-900">
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </div>
      <CtaSection title={page.ctaTitle} />
    </>
  );
}
