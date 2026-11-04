import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Bookmark, BookmarkCheck, Clock, Minus, Plus, ShieldCheck, Truck } from 'lucide-react';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import ProductCard from '../components/ui/ProductCard.jsx';
import CtaSection from '../components/ui/CtaSection.jsx';
import NotFound from './NotFound.jsx';
import { useCart } from '../context/CartContext.jsx';
import { categoryName } from '../data/products.js';
import { useProducts } from '../context/ProductsContext.jsx';
import { LEAD_KINDS, fmtLeadSource } from '../lib/leadTime.js';
import { useDocumentTitle } from '../lib/useDocumentTitle.js';

export default function ProductDetail() {
  const { slug } = useParams();
  const { products: PRODUCTS, findProduct } = useProducts();
  const product = findProduct(slug);
  const cart = useCart();
  const [qty, setQty] = useState(1);
  useDocumentTitle(product?.name, product?.description);

  if (!product) return <NotFound />;

  const saved = cart.isSaved(product.id);
  const related = PRODUCTS.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);

  return (
    <>
      <div className="bg-[#f6f8fc] text-navy-900">
        <div className="container-site py-8">
          <Breadcrumb
            light
            items={[
              { label: 'Products', to: '/products' },
              { label: categoryName(product.category), to: `/products?category=${product.category}` },
              { label: product.name },
            ]}
          />

          <div className="mt-6 grid gap-10 lg:grid-cols-2">
            <div className={`relative flex min-h-[340px] items-center justify-center rounded-xl border border-slate-200 p-8 ${product.dark ? 'bg-[#03184a]' : 'bg-white'}`}>
              {product.badge && <span className="absolute left-4 top-4 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">{product.badge}</span>}
              <img src={product.image} alt={product.name} className="max-h-[320px] w-full max-w-[520px] object-contain" />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-brand">{product.manufacturer === 'Others' ? 'Multi-vendor' : product.manufacturer}</p>
              <h1 className="mt-2 text-4xl font-bold">{product.name}</h1>
              <p className="mt-1 text-lg text-slate-500">{product.subtitle}</p>
              <p className="mt-5 leading-relaxed text-slate-700">{product.description}</p>

              <ul className="mt-5 space-y-2 text-[15px] text-slate-700">
                {product.highlights.map((h) => (
                  <li key={h} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" /> {h}
                  </li>
                ))}
              </ul>

              <ul className="mt-5 flex flex-wrap gap-2">
                {product.tags.map((t) => (
                  <li key={t} className="rounded bg-white px-3 py-1 text-sm text-slate-700 ring-1 ring-slate-200">
                    {t}
                  </li>
                ))}
              </ul>

              {product.publicPrice && (
                <p className="mt-6 text-2xl font-bold text-navy-900">
                  {product.publicPrice} <span className="text-sm font-normal text-slate-500">indicative — final price confirmed in your quotation</span>
                </p>
              )}
              <div className="mt-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <Clock className="mt-0.5 h-5 w-5 shrink-0" />
                <p>
                  <span className="font-semibold">{LEAD_KINDS[product.leadTime?.kind]?.label || LEAD_KINDS['quote-only'].label}.</span>{' '}
                  {product.leadTime?.text && !['quote-only', 'needs-confirmation'].includes(product.leadTime.kind) ? (
                    <>
                      {product.leadTime.text} <span className="text-amber-800/80">{fmtLeadSource(product.leadTime)}</span>{' '}
                    </>
                  ) : null}
                  Pricing, availability and lead time are confirmed with the supplier and stated in your written quotation.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="flex h-12 items-center rounded border border-slate-300 bg-white">
                  <button type="button" aria-label="Decrease quantity" className="px-3.5" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    aria-label="Quantity"
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-14 bg-transparent text-center text-sm focus:outline-none"
                  />
                  <button type="button" aria-label="Increase quantity" className="px-3.5" onClick={() => setQty((q) => q + 1)}>
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {product.quoteAvailable === false ? (
                  <Link to="/company/contact" className="btn-blue h-12 px-7 text-[15px]">
                    Contact us <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <button type="button" onClick={() => cart.add(product, qty)} className="btn-blue h-12 px-7 text-[15px]">
                    Add to Quote <ArrowRight className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => cart.toggleSaved(product.id)}
                  aria-pressed={saved}
                  className="flex h-12 items-center gap-2 rounded border border-slate-300 bg-white px-4 text-sm font-medium hover:border-brand hover:text-brand"
                >
                  {saved ? <BookmarkCheck className="h-4 w-4 text-brand" /> : <Bookmark className="h-4 w-4" />} {saved ? 'Saved' : 'Save'}
                </button>
              </div>

              <div className="mt-6 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                <p className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-brand" /> KYB & export checks may apply
                </p>
                <p className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-brand" /> International delivery coordination
                </p>
              </div>
            </div>
          </div>

          <section className="mt-12 rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-semibold">Specifications</h2>
            <dl className="mt-4 divide-y divide-slate-100">
              {product.specs.map(([k, v]) => (
                <div key={k} className="grid gap-1 py-3 sm:grid-cols-[220px_1fr]">
                  <dt className="text-sm font-medium text-slate-500">{k}</dt>
                  <dd className="text-sm">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs text-slate-500">
              Specifications are indicative and can vary by configuration and manufacturer revision. Final specifications are confirmed in the quotation.
            </p>
          </section>

          {related.length > 0 && (
            <section className="mt-12">
              <div className="flex items-end justify-between">
                <h2 className="text-2xl font-semibold">Related products</h2>
                <Link to={`/products?category=${product.category}`} className="link-blue">
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
      <CtaSection />
    </>
  );
}
