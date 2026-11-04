import { Link } from 'react-router-dom';
import { ArrowRight, Bookmark, BookmarkCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { categoryName } from '../../data/products.js';

export default function ProductCard({ product, layout = 'grid' }) {
  const cart = useCart();
  const saved = cart.isSaved(product.id);
  const SaveIcon = saved ? BookmarkCheck : Bookmark;
  const list = layout === 'list';

  return (
    <article
      className={`group relative flex rounded-lg border border-slate-200 bg-white p-4 text-navy-900 shadow-sm transition-shadow hover:shadow-lg ${
        list ? 'flex-col gap-5 sm:flex-row sm:items-center' : 'flex-col'
      }`}
    >
      {product.badge && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-brand px-2.5 py-1 text-xs font-semibold text-white">{product.badge}</span>
      )}
      <Link
        to={`/products/${product.id}`}
        className={`flex items-center justify-center overflow-hidden rounded ${product.dark ? 'bg-[#03184a]' : 'bg-white'} ${
          list ? 'h-36 sm:w-56 sm:shrink-0' : 'h-[130px]'
        }`}
      >
        <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105" loading="lazy" />
      </Link>

      <div className="flex flex-1 flex-col">
        <h3 className={`${list ? '' : 'mt-3'} text-lg font-semibold leading-snug`}>
          <Link to={`/products/${product.id}`} className="hover:text-brand">
            {product.name}
          </Link>
        </h3>
        <p className="text-sm text-slate-500">{product.subtitle || categoryName(product.category)}</p>
        <ul className="mt-2 space-y-0.5 text-[13px] text-slate-600">
          {product.highlights.map((h) => (
            <li key={h} className="flex gap-2">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-slate-500" />
              {h}
            </li>
          ))}
        </ul>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {product.tags.map((t) => (
            <li key={t} className="rounded bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
              {t}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex gap-2 pt-4">
          <button type="button" onClick={() => cart.add(product)} className="btn-blue h-10 flex-1 text-sm">
            Request a Quote <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => cart.toggleSaved(product.id)}
            aria-label={saved ? 'Remove from saved products' : 'Save product'}
            aria-pressed={saved}
            className={`grid h-10 w-10 place-items-center rounded border transition-colors ${
              saved ? 'border-brand bg-brand/10 text-brand' : 'border-slate-300 text-navy-900 hover:border-brand hover:text-brand'
            }`}
          >
            <SaveIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
