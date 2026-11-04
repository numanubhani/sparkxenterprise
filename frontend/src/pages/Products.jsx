import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, ChevronDown, ChevronUp, LayoutGrid, List, SlidersHorizontal, X } from 'lucide-react';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import ProductCard from '../components/ui/ProductCard.jsx';
import { getIcon } from '../components/ui/icons.js';
import { GPU_SERIES, MANUFACTURERS } from '../data/products.js';
import { useProducts } from '../context/ProductsContext.jsx';
import { useDocumentTitle } from '../lib/useDocumentTitle.js';

const SORTS = {
  featured: { label: 'Featured', fn: (a, b) => Number(!!b.featured) - Number(!!a.featured) || Number(!!b.badge) - Number(!!a.badge) },
  'name-asc': { label: 'Name: A to Z', fn: (a, b) => a.name.localeCompare(b.name) },
  'name-desc': { label: 'Name: Z to A', fn: (a, b) => b.name.localeCompare(a.name) },
};

function Checkbox({ checked, onChange, label, count }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-1.5 text-sm text-navy-900">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-[18px] w-[18px] rounded border-slate-300 accent-brand" />
      <span className="flex-1">{label}</span>
      <span className="grid h-5 min-w-[28px] place-items-center rounded-full bg-slate-100 px-1.5 text-xs text-slate-600">{count}</span>
    </label>
  );
}

export default function Products() {
  const { products: PRODUCTS, categories: CATEGORIES } = useProducts();
  const [params, setParams] = useSearchParams();
  const [layout, setLayout] = useState('grid');
  const [sort, setSort] = useState('featured');
  const [catsOpen, setCatsOpen] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const category = params.get('category') || '';
  const q = (params.get('q') || '').trim();
  const makers = params.getAll('mfr');
  const series = params.getAll('series');

  const activeCategory = CATEGORIES.find((c) => c.slug === category);
  useDocumentTitle(activeCategory ? `${activeCategory.name} | Products` : 'AI Infrastructure Products');

  const setParam = (key, values) => {
    const next = new URLSearchParams(params);
    next.delete(key);
    [].concat(values).filter(Boolean).forEach((v) => next.append(key, v));
    setParams(next, { replace: true });
  };
  const toggleIn = (key, list, value) => setParam(key, list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const matchesQuery = (p) =>
    !q || [p.name, p.subtitle, p.manufacturer, ...(p.tags || [])].join(' ').toLowerCase().includes(q.toLowerCase());

  // Counts reflect the search query only, so users can see what each filter would add
  const base = PRODUCTS.filter(matchesQuery);
  const countBy = (fn) => base.filter(fn).length;

  const results = useMemo(
    () =>
      base
        .filter((p) => !category || p.category === category)
        .filter((p) => !makers.length || makers.includes(p.manufacturer))
        .filter((p) => !series.length || series.includes(p.series))
        .sort(SORTS[sort].fn),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [params, sort]
  );

  const hasFilters = Boolean(category || q || makers.length || series.length);

  const sidebar = (
    <aside className="rounded-lg border border-slate-200 bg-white text-navy-900">
      <div className="border-b border-slate-200 p-4">
        <button type="button" onClick={() => setCatsOpen((o) => !o)} className="flex w-full items-center justify-between px-2 text-base font-semibold">
          Product Categories {catsOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </button>
        {catsOpen && (
          <ul className="mt-3 space-y-1">
            {CATEGORIES.map((c) => {
              const Icon = getIcon(c.icon);
              const active = c.slug === category;
              return (
                <li key={c.slug}>
                  <button
                    type="button"
                    onClick={() => setParam('category', active ? '' : c.slug)}
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      active ? 'bg-brand/10 font-semibold text-brand' : 'hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" strokeWidth={1.6} />
                    <span className="flex-1">{c.name}</span>
                    <span
                      className={`grid h-5 min-w-[28px] place-items-center rounded-full px-1.5 text-xs ${
                        active ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {countBy((p) => p.category === c.slug)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div className="border-b border-slate-200 p-5">
        <h3 className="mb-2 text-base font-semibold">Manufacturer</h3>
        {MANUFACTURERS.map((m) => (
          <Checkbox key={m} label={m} checked={makers.includes(m)} onChange={() => toggleIn('mfr', makers, m)} count={countBy((p) => p.manufacturer === m)} />
        ))}
      </div>
      <div className="p-5">
        <h3 className="mb-2 text-base font-semibold">GPU Series</h3>
        {GPU_SERIES.map((s) => (
          <Checkbox key={s} label={s} checked={series.includes(s)} onChange={() => toggleIn('series', series, s)} count={countBy((p) => p.series === s)} />
        ))}
      </div>
    </aside>
  );

  return (
    <div className="bg-[#f6f8fc] text-navy-900">
      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-y-0 right-0 hidden w-[56%] md:block">
          <img src="/images/catalog-hero.jpg" alt="" className="h-full w-full object-cover object-left" />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/30 to-transparent" />
        </div>
        <div className="container-site relative py-9">
          <Breadcrumb light items={activeCategory ? [{ label: 'Products', to: '/products' }, { label: activeCategory.name }] : [{ label: 'Products' }]} />
          <h1 className="mt-5 text-[38px] font-bold leading-tight sm:text-[50px]">
            {activeCategory ? activeCategory.name.split(' / ')[0] : 'AI Infrastructure'} <span className="text-brand">Products</span>
          </h1>
          <p className="mt-3 max-w-xl text-lg leading-relaxed text-slate-600">
            GPUs, servers, networking, storage and complete infrastructure solutions from leading manufacturers.
          </p>
        </div>
      </section>

      <div className="container-site grid gap-6 py-8 lg:grid-cols-[292px_1fr]">
        <div className="lg:hidden">
          <button type="button" onClick={() => setFiltersOpen((o) => !o)} className="flex items-center gap-2 rounded border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium">
            <SlidersHorizontal className="h-4 w-4" /> {filtersOpen ? 'Hide filters' : 'Show filters'}
          </button>
          {filtersOpen && <div className="mt-4">{sidebar}</div>}
        </div>
        <div className="hidden lg:block">{sidebar}</div>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-[15px] text-slate-700">
              Showing {results.length} of {PRODUCTS.length} products
              {q && (
                <>
                  {' '}
                  for <span className="font-semibold">“{q}”</span>
                </>
              )}
            </p>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                Sort by:
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-10 rounded border border-slate-300 bg-white px-3 text-sm text-navy-900">
                  {Object.entries(SORTS).map(([k, s]) => (
                    <option key={k} value={k}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex overflow-hidden rounded border border-slate-300 bg-white">
                {[
                  ['grid', LayoutGrid, 'Grid'],
                  ['list', List, 'List'],
                ].map(([key, Icon, label]) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={layout === key}
                    onClick={() => setLayout(key)}
                    className={`flex h-10 items-center gap-2 px-4 text-sm ${layout === key ? 'bg-brand text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Icon className="h-4 w-4" /> {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {hasFilters && (
            <button type="button" onClick={() => setParams({}, { replace: true })} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline">
              <X className="h-4 w-4" /> Clear all filters
            </button>
          )}

          {results.length ? (
            <div className={`mt-5 grid gap-4 ${layout === 'grid' ? 'sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4' : ''}`}>
              {results.map((p) => (
                <ProductCard key={p.id} product={p} layout={layout} />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
              <h2 className="text-xl font-semibold">No listed products match your filters</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                Our catalog shows a curated selection. We can source many more models and configurations — send us your requirements.
              </p>
              <Link to="/solutions/custom-sourcing" className="btn-blue mt-6 h-11 px-6 text-sm">
                Request Custom Sourcing <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-lg bg-navy-900 p-6 text-white sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold">Can’t find what you need?</h2>
              <p className="mt-1 text-sm text-slate-300">We source specialized hardware, large quantities and custom configurations.</p>
            </div>
            <Link to="/solutions/custom-sourcing" className="btn-white h-11 shrink-0 px-6 text-sm">
              Custom Sourcing Request <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
