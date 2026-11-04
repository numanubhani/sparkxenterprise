import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, ImagePlus, Package, Plus, Search, Trash2 } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { CATEGORIES as BASE_CATEGORIES, PRODUCTS as STARTER_PRODUCTS, categoryName } from '../../data/products.js';
import { Card, Empty, ErrorNote, Field, Loading, PageTitle, SuccessNote, lightInput } from '../account/ui.jsx';

const BASE_SLUGS = BASE_CATEGORIES.map((c) => c.slug);
const ADD_NEW = '__new__';
// built-in categories + any custom ones already used by products
const allCategories = (products) => [...new Set([...BASE_SLUGS, ...(products || []).map((p) => p.category).filter(Boolean)])];

// Shrink big photos in the browser before uploading (keeps uploads small and fast)
function fileToDataUrl(file, maxSide = 1600) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('That file is not a valid image.'));
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/webp', 0.9)); // keeps transparency
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// Image URL box + "Upload" button + preview
function ImageField({ label, hint, value, onChange }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setErr('');
    setBusy(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      const r = await api('/api/admin/uploads', { method: 'POST', body: { filename: file.name, dataUrl } });
      onChange(r.url);
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <span className="mb-1.5 block text-[13px] font-medium text-slate-700">{label}</span>
      <div className="flex gap-2">
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Paste an image URL, or upload" className={lightInput} />
        <label className={`inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded border border-slate-300 bg-white px-3 text-sm font-medium hover:bg-slate-50 ${busy ? 'pointer-events-none opacity-50' : ''}`}>
          <ImagePlus className="h-4 w-4" /> {busy ? 'Uploading…' : 'Upload'}
          <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={pick} className="sr-only" />
        </label>
      </div>
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
      {err && <span className="mt-1 block text-xs text-red-700">{err}</span>}
      {value && (
        <div className="mt-2 flex items-center gap-3">
          <img src={value} alt="" className="h-20 w-20 rounded border border-slate-200 bg-slate-50 object-contain" onError={(e) => (e.currentTarget.style.opacity = 0.3)} />
          <button type="button" onClick={() => onChange('')} className="text-xs text-red-700 hover:underline">
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
const LEAD_KINDS = [
  ['quote-only', 'Quote only (no estimate shown)'],
  ['needs-confirmation', 'Needs confirmation'],
  ['confirmed', 'Confirmed'],
  ['range', 'Range'],
  ['eta', 'ETA'],
];
const textarea = `${lightInput} h-auto py-2.5`;
const lines = (v) => (v || '').split('\n').map((s) => s.trim()).filter(Boolean);
const csv = (v) => (v || '').split(',').map((s) => s.trim()).filter(Boolean);

const EMPTY = {
  name: '', category: 'gpus', manufacturer: '', mpn: '', sku: '', series: '', subtitle: '', description: '',
  image: '', darkImage: '', badge: '', publicPrice: '', supplierRef: '',
  highlights: '', tags: '', cartTags: '', specs: '',
  featured: false, active: true, quoteAvailable: true, dark: false,
  leadKind: 'quote-only', leadText: '', leadSource: '',
};

// API document -> flat form state
function toForm(p) {
  return {
    ...EMPTY,
    ...Object.fromEntries(Object.keys(EMPTY).filter((k) => typeof EMPTY[k] === 'string' && typeof p[k] === 'string').map((k) => [k, p[k]])),
    category: p.category || 'gpus',
    highlights: (p.highlights || []).join('\n'),
    tags: (p.tags || []).join(', '),
    cartTags: (p.cartTags || []).join(', '),
    specs: (p.specs || []).map((r) => `${r[0]}: ${r[1]}`).join('\n'),
    featured: !!p.featured,
    active: p.active !== false,
    quoteAvailable: p.quoteAvailable !== false,
    dark: !!p.dark,
    leadKind: p.leadTime?.kind || 'quote-only',
    leadText: p.leadTime?.text || '',
    leadSource: p.leadTime?.source || '',
  };
}

// form state -> API payload
function toPayload(f) {
  const { leadKind, leadText, leadSource, highlights, tags, cartTags, specs, ...rest } = f;
  return {
    ...rest,
    highlights: lines(highlights),
    tags: csv(tags),
    cartTags: csv(cartTags),
    specs: lines(specs).map((l) => {
      const i = l.indexOf(':');
      return i === -1 ? [l, ''] : [l.slice(0, i), l.slice(i + 1)];
    }),
    leadTime: { kind: leadKind, text: leadText, source: leadSource },
  };
}

/* --------------------------------- List ---------------------------------- */
export function AdminProducts() {
  const { data, loading, error, reload } = useApi('/api/admin/products');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [msg, setMsg] = useState({ error: '', ok: '' });
  const [busy, setBusy] = useState(false);

  const items = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (data || []).filter((p) => (!cat || p.category === cat) && (!s || [p.name, p.manufacturer, p.mpn, p.sku, p.slug].some((v) => (v || '').toLowerCase().includes(s))));
  }, [data, q, cat]);

  const importStarter = async () => {
    setBusy(true);
    setMsg({ error: '', ok: '' });
    try {
      const r = await api('/api/admin/products/import', { method: 'POST', body: { products: STARTER_PRODUCTS } });
      setMsg({ error: '', ok: `Imported ${r.imported} starter product(s).` });
      reload();
    } catch (err) {
      setMsg({ error: err.message, ok: '' });
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (p) => {
    try {
      await api(`/api/admin/products/${p.slug}`, { method: 'PATCH', body: { active: !p.active } });
      reload();
    } catch (err) {
      setMsg({ error: err.message, ok: '' });
    }
  };

  return (
    <>
      <PageTitle
        title="Products"
        subtitle="Manage the public catalog. Hidden products are not shown on the website."
        action={
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={importStarter} disabled={busy} className="inline-flex h-10 items-center gap-2 rounded border border-slate-300 bg-white px-4 text-sm font-medium hover:bg-slate-50 disabled:opacity-50">
              <Download className="h-4 w-4" /> Import starter catalog
            </button>
            <Link to="/admin/products/new" className="inline-flex h-10 items-center gap-2 rounded bg-brand px-4 text-sm font-semibold text-white hover:opacity-90">
              <Plus className="h-4 w-4" /> Add product
            </Link>
          </div>
        }
      />
      <div className="mb-3 space-y-2">
        <ErrorNote msg={msg.error} />
        <SuccessNote msg={msg.ok} />
      </div>
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, manufacturer, MPN, SKU…" className={`${lightInput} pl-9`} />
        </div>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className={`${lightInput} sm:!w-auto`}>
          <option value="">All categories</option>
          {allCategories(data).map((c) => (
            <option key={c} value={c}>
              {categoryName(c)}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorNote msg={error} />
      ) : items.length ? (
        <>
          <p className="mb-2 text-sm text-slate-500">{items.length} product(s)</p>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  {['Product', 'Category', 'Manufacturer', 'Lead time', 'Visibility'].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((p) => (
                  <tr key={p.slug} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link to={`/admin/products/${p.slug}`} className="font-semibold text-brand hover:underline">
                        {p.name}
                      </Link>
                      {p.featured && <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-800">Featured</span>}
                      <span className="block text-xs text-slate-500">{p.mpn || p.sku || p.slug}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{categoryName(p.category)}</td>
                    <td className="px-4 py-3 text-slate-600">{p.manufacturer || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{p.leadTime?.kind || 'quote-only'}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleActive(p)}
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${p.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}
                        title="Click to toggle"
                      >
                        {p.active ? 'Visible' : 'Hidden'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <Empty>
          <Package className="mx-auto mb-2 h-8 w-8 text-slate-400" />
          {data?.length ? 'No products match these filters.' : 'No products in the database yet. Add one, or import the starter catalog.'}
        </Empty>
      )}
    </>
  );
}

/* ------------------------------ Add / Edit ------------------------------- */
export function AdminProductForm() {
  const { slug } = useParams();
  const isNew = !slug;
  const navigate = useNavigate();
  const { data, loading, error } = useApi('/api/admin/products');
  const [addingCat, setAddingCat] = useState(false);
  const [f, setF] = useState(EMPTY);
  const [ready, setReady] = useState(isNew);
  const [msg, setMsg] = useState({ error: '', ok: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew || !data) return;
    const p = data.find((x) => x.slug === slug);
    if (p) setF(toForm(p));
    setReady(true);
  }, [data, slug, isNew]);

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const showLeadData = !['quote-only', 'needs-confirmation'].includes(f.leadKind);

  const categories = allCategories(data);
  const onCategory = (e) => {
    if (e.target.value === ADD_NEW) {
      setAddingCat(true);
      setF((x) => ({ ...x, category: '' }));
    } else {
      setAddingCat(false);
      setF((x) => ({ ...x, category: e.target.value }));
    }
  };

  if (!isNew) {
    if (loading || !ready) return error ? <ErrorNote msg={error} /> : <Loading />;
    if (!data.some((x) => x.slug === slug)) return <ErrorNote msg="Product not found." />;
  }

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ error: '', ok: '' });
    try {
      if (isNew) {
        const p = await api('/api/admin/products', { method: 'POST', body: toPayload(f) });
        navigate(`/admin/products/${p.slug}`, { replace: true });
      } else {
        await api(`/api/admin/products/${slug}`, { method: 'PATCH', body: toPayload(f) });
        setMsg({ error: '', ok: 'Product saved.' });
      }
    } catch (err) {
      setMsg({ error: err.message, ok: '' });
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete "${f.name}"? This cannot be undone.`)) return;
    try {
      await api(`/api/admin/products/${slug}`, { method: 'DELETE' });
      navigate('/admin/products', { replace: true });
    } catch (err) {
      setMsg({ error: err.message, ok: '' });
    }
  };

  const check = (k, label) => (
    <label className="flex items-center gap-2 text-sm text-slate-700">
      <input type="checkbox" checked={f[k]} onChange={set(k)} className="h-4 w-4 rounded border-slate-300" /> {label}
    </label>
  );

  return (
    <>
      <Link to="/admin/products" className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>
      <PageTitle title={isNew ? 'Add product' : f.name || 'Edit product'} subtitle={isNew ? 'Create a new catalog item.' : `/${slug}`} />

      <form onSubmit={save} className="space-y-6">
        <Card title="Basics">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" required>
              <input required value={f.name} onChange={set('name')} className={lightInput} />
            </Field>
            <Field label="Category" required>
              <select value={addingCat ? ADD_NEW : f.category} onChange={onCategory} className={lightInput}>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {categoryName(c)}
                  </option>
                ))}
                <option value={ADD_NEW}>+ Add new category…</option>
              </select>
              {addingCat && (
                <input
                  autoFocus
                  required
                  value={f.category}
                  onChange={set('category')}
                  placeholder="New category name, e.g. Liquid Cooling"
                  className={`${lightInput} mt-2`}
                />
              )}
            </Field>
            <Field label="Manufacturer">
              <input value={f.manufacturer} onChange={set('manufacturer')} className={lightInput} />
            </Field>
            <Field label="Series">
              <input value={f.series} onChange={set('series')} className={lightInput} />
            </Field>
            <Field label="MPN">
              <input value={f.mpn} onChange={set('mpn')} className={lightInput} />
            </Field>
            <Field label="SKU">
              <input value={f.sku} onChange={set('sku')} className={lightInput} />
            </Field>
            <Field label="Subtitle">
              <input value={f.subtitle} onChange={set('subtitle')} className={lightInput} />
            </Field>
            <Field label="Badge" hint='e.g. "New"'>
              <input value={f.badge} onChange={set('badge')} className={lightInput} />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Description">
              <textarea rows={4} value={f.description} onChange={set('description')} className={textarea} />
            </Field>
          </div>
        </Card>

        <Card title="Details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Highlights" hint="One per line">
              <textarea rows={5} value={f.highlights} onChange={set('highlights')} className={textarea} />
            </Field>
            <Field label="Specs" hint="One per line, as  Label: Value">
              <textarea rows={5} value={f.specs} onChange={set('specs')} className={textarea} />
            </Field>
            <Field label="Tags" hint="Comma separated">
              <input value={f.tags} onChange={set('tags')} className={lightInput} />
            </Field>
            <Field label="Cart tags" hint="Comma separated">
              <input value={f.cartTags} onChange={set('cartTags')} className={lightInput} />
            </Field>
            <ImageField label="Product image" hint="Upload a file, or paste a URL / path like /images/my-product.png" value={f.image} onChange={(v) => setF((x) => ({ ...x, image: v }))} />
            <ImageField label="Dark-background image (optional)" value={f.darkImage} onChange={(v) => setF((x) => ({ ...x, darkImage: v }))} />
          </div>
        </Card>

        <Card title="Lead time & pricing">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Lead-time type" hint="Only enter a time and source when it comes from a supplier — never guess.">
              <select value={f.leadKind} onChange={set('leadKind')} className={lightInput}>
                {LEAD_KINDS.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>
            <div />
            {showLeadData && (
              <>
                <Field label="Lead-time text">
                  <input value={f.leadText} onChange={set('leadText')} placeholder="e.g. 4–6 weeks" className={lightInput} />
                </Field>
                <Field label="Source">
                  <input value={f.leadSource} onChange={set('leadSource')} placeholder="e.g. Supplier confirmation, 12 Mar" className={lightInput} />
                </Field>
              </>
            )}
            <Field label="Public price" hint="Only if the supplier authorised publishing a price">
              <input value={f.publicPrice} onChange={set('publicPrice')} className={lightInput} />
            </Field>
            <Field label="Supplier ref (internal)" hint="Never shown on the public site">
              <input value={f.supplierRef} onChange={set('supplierRef')} className={lightInput} />
            </Field>
          </div>
        </Card>

        <Card title="Visibility">
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {check('active', 'Visible on website')}
            {check('featured', 'Featured')}
            {check('quoteAvailable', 'Quote available')}
            {check('dark', 'Dark card style')}
          </div>
        </Card>

        <div className="space-y-2">
          <ErrorNote msg={msg.error} />
          <SuccessNote msg={msg.ok} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button type="submit" disabled={saving} className="inline-flex h-11 items-center rounded bg-brand px-6 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
            {saving ? 'Saving…' : isNew ? 'Create product' : 'Save changes'}
          </button>
          {!isNew && (
            <button type="button" onClick={remove} className="inline-flex h-11 items-center gap-2 rounded border border-red-200 px-4 text-sm font-medium text-red-700 hover:bg-red-50">
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          )}
        </div>
      </form>
    </>
  );
}
