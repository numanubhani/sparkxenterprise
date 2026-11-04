import Breadcrumb from './Breadcrumb.jsx';
import { getIcon } from './icons.js';

// Dark hero used by How It Works, Solutions, Company and Resources pages.
export default function PageHero({ crumbs = [], eyebrow, title, highlight, intro, image = '/images/hiw-hero.jpg', badges = [], children }) {
  return (
    <section className="relative overflow-hidden bg-navy-900">
      <div className="absolute inset-y-0 right-0 w-full lg:w-[55%]">
        <img src={image} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900 via-navy-900/40 to-transparent" />
        <div className="absolute inset-0 bg-navy-900/75 lg:hidden" />
      </div>
      <div className="container-site relative py-10 lg:py-12">
        <Breadcrumb items={crumbs} />
        {eyebrow && <p className="eyebrow mt-7 text-brand-sky">{eyebrow}</p>}
        <h1 className="mt-3 max-w-2xl font-serif text-[40px] font-medium leading-[1.08] sm:text-[52px]">
          {title}
          {highlight && (
            <>
              {' '}
              <br className="hidden sm:block" />
              <span className="text-brand">{highlight}</span>
            </>
          )}
        </h1>
        {intro && <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-slate-200 sm:text-base">{intro}</p>}
        {badges.length > 0 && (
          <ul className="mt-7 flex flex-wrap gap-x-10 gap-y-4">
            {badges.map((b) => {
              const Icon = getIcon(b.icon);
              return (
                <li key={b.title} className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full border border-white/25">
                    <Icon className="h-5 w-5 text-brand-sky" strokeWidth={1.5} />
                  </span>
                  <span>
                    <span className="block text-[13px] font-semibold">{b.title}</span>
                    <span className="block text-xs text-slate-300">{b.text}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
        {children}
      </div>
    </section>
  );
}
