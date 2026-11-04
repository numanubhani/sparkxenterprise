import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';
import { CATEGORIES as BASE_CATEGORIES, PRODUCTS as STATIC_PRODUCTS, prettySlug } from '../data/products.js';

const ProductsContext = createContext(null);

// API documents use `slug`; the UI uses `id`. Fill defaults so pages never crash on sparse admin-created records.
const normalize = (p) => ({
  ...p,
  id: p.slug || p.id,
  highlights: p.highlights || [],
  tags: p.tags || [],
  cartTags: p.cartTags || [],
  specs: p.specs || [],
});

// Starts with the bundled catalog (instant render, works offline), then swaps in the live catalog from the API.
export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(STATIC_PRODUCTS);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api('/api/products')
      .then((list) => {
        if (!cancelled && Array.isArray(list) && list.length) {
          setProducts(list.map(normalize));
          setLive(true);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => {
    // Built-in categories plus any new ones an admin typed in when adding a product
    const known = new Set(BASE_CATEGORIES.map((c) => c.slug));
    const extra = [...new Set(products.map((p) => p.category).filter((c) => c && !known.has(c)))].map((slug) => ({ slug, name: prettySlug(slug), icon: 'Package' }));
    return { products, live, categories: [...BASE_CATEGORIES, ...extra], findProduct: (id) => products.find((p) => p.id === id) };
  }, [products, live]);
  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export const useProducts = () => useContext(ProductsContext);
