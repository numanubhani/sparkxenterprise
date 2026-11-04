import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { api } from '../lib/api.js';

const CartContext = createContext(null);
const CART_KEY = 'sparkx-quote-cart';
const SAVED_KEY = 'sparkx-saved-products';

function load(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function persist(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — state just won't persist */
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => load(CART_KEY));
  const [saved, setSaved] = useState(() => load(SAVED_KEY));
  const [toast, setToast] = useState(null);

  useEffect(() => persist(CART_KEY, items), [items]);
  useEffect(() => persist(SAVED_KEY, saved), [saved]);

  // Saved products live on the server for logged-in customers.
  // On login, merge this device's list with the account's list; afterwards push every change.
  const { user } = useAuth();
  const syncedUser = useRef(null);
  useEffect(() => {
    if (!user) {
      syncedUser.current = null;
      return;
    }
    if (syncedUser.current !== user.id) {
      syncedUser.current = user.id;
      const merged = [...new Set([...(user.savedProducts || []), ...saved])];
      setSaved(merged);
      if (merged.length !== (user.savedProducts || []).length) api('/api/account/saved', { method: 'PUT', body: { savedProducts: merged } }).catch(() => {});
      return;
    }
    const t = setTimeout(() => api('/api/account/saved', { method: 'PUT', body: { savedProducts: saved } }).catch(() => {}), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, saved]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const value = useMemo(
    () => ({
      items,
      count: items.length,
      saved,
      toast,
      add(product, quantity = 1) {
        setItems((prev) => {
          const existing = prev.find((i) => i.id === product.id);
          if (existing) return prev.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i));
          const { id, name, subtitle, image, darkImage, category, cartTags, dark } = product;
          // The quote cart is dark, so prefer the dark-background product shot when there is one
          return [...prev, { id, name, subtitle, image: darkImage || image, category, cartTags, dark: dark || !!darkImage, quantity, note: '', selected: true }];
        });
        setToast(`${product.name} added to your quote`);
      },
      has: (id) => items.some((i) => i.id === id),
      update(id, patch) {
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
      },
      setAllSelected(selected) {
        setItems((prev) => prev.map((i) => ({ ...i, selected })));
      },
      remove(id) {
        setItems((prev) => prev.filter((i) => i.id !== id));
      },
      removeSelected() {
        setItems((prev) => prev.filter((i) => !i.selected));
      },
      clear() {
        setItems([]);
      },
      isSaved: (id) => saved.includes(id),
      toggleSaved(id) {
        setSaved((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
      },
    }),
    [items, saved, toast]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
