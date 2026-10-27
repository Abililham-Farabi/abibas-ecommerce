import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Modal, Alert } from '../components/ui';
import { useProducts } from '../hooks/useProducts';
import { CATEGORIES } from '../data/products.demo';
import { SIZES, stockOf } from '../utils/format';

const SORTS = [
  { id: 'relevansi', label: 'Relevansi' },
  { id: 'termurah', label: 'Harga termurah' },
  { id: 'termahal', label: 'Harga termahal' },
  { id: 'nama', label: 'Nama A–Z' },
];

export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const { products, loading, error: loadError } = useProducts();
  const [drawer, setDrawer] = useState(false);

  const q = params.get('q') || '';
  const kat = params.get('kat') || 'Semua';
  const size = params.get('size') || 'Semua';
  const sort = params.get('sort') || 'relevansi';

  function set(key, value, clear = false) {
    const next = clear ? new URLSearchParams() : new URLSearchParams(params);
    if (!value || value === 'Semua' || value === 'relevansi') next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  }

  const filtered = useMemo(() => {
    const list = products.filter((p) => {
      if (kat !== 'Semua' && p.category !== kat) return false;
      if (size !== 'Semua' && stockOf(p, size) <= 0) return false;
      if (q.trim() && !`${p.name} ${p.category}`.toLowerCase().includes(q.trim().toLowerCase()))
        return false;
      return true;
    });
    const sorted = [...list];
    if (sort === 'termurah') sorted.sort((a, b) => a.price - b.price);
    else if (sort === 'termahal') sorted.sort((a, b) => b.price - a.price);
    else if (sort === 'nama') sorted.sort((a, b) => a.name.localeCompare(b.name, 'id'));
    return sorted;
  }, [products, q, kat, size, sort]);

  const activeFilters = [kat !== 'Semua', size !== 'Semua', q.trim() !== ''].filter(Boolean).length;

  const filterBody = (
    <div className="space-y-5">
      <div>
        <p className="label">Kategori</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter kategori">
          {['Semua', ...CATEGORIES].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => set('kat', c)}
              aria-pressed={kat === c}
              className={`rounded-full border px-4 py-2 text-sm ${
                kat === c
                  ? 'border-ink-900 bg-ink-900 text-white'
                  : 'border-ink-200 bg-white text-ink-600 hover:border-ink-900'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="label">Ukuran tersedia</span>
          <select
            value={size}
            onChange={(e) => set('size', e.target.value)}
            aria-label="Filter ukuran tersedia"
            className="input w-auto"
          >
            <option>Semua</option>
            {SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="label">Urutkan</span>
          <select
            value={sort}
            onChange={(e) => set('sort', e.target.value)}
            aria-label="Urutkan produk"
            className="input w-auto"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </label>
        {activeFilters > 0 && (
          <button
            type="button"
            onClick={() => { setParams({}, { replace: true }); setDrawer(false); }}
            className="text-sm text-ink-500 underline underline-offset-4 hover:text-ink-900"
          >
            Atur ulang
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="container-store py-8">
      <nav className="text-sm text-ink-400" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-ink-900">Beranda</Link>
        {' / '}
        {kat === 'Semua' ? (
          <span className="text-ink-900">Katalog</span>
        ) : (
          <>
            <Link to="/katalog" className="hover:text-ink-900">Katalog</Link>
            {' / '}
            <span className="text-ink-900">{kat}</span>
          </>
        )}
      </nav>

      <div className="mt-2 flex items-baseline justify-between gap-4">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">
          {kat === 'Semua' ? 'Semua produk' : kat}
        </h1>
        <p className="shrink-0 text-sm text-ink-500" aria-live="polite">
          {loading ? 'Memuat…' : `${filtered.length} produk`}
        </p>
      </div>

      <div className="mt-6">
        <input
          value={q}
          onChange={(e) => set('q', e.target.value)}
          placeholder="Cari sepatu, baju, jam…"
          aria-label="Cari produk"
          className="input lg:max-w-sm"
        />
      </div>

      {/* Toolbar desktop */}
      <div className="mt-4 hidden lg:block">{filterBody}</div>

      {/* Tombol filter mobile */}
      <div className="mt-4 lg:hidden">
        <button
          type="button"
          onClick={() => setDrawer(true)}
          className="btn-secondary w-full sm:w-auto"
          aria-haspopup="dialog"
        >
          Filter &amp; urutkan{activeFilters > 0 ? ` (${activeFilters})` : ''}
        </button>
      </div>

      {drawer && (
        <Modal title="Filter & urutkan" onClose={() => setDrawer(false)}>
          {filterBody}
          <button type="button" onClick={() => setDrawer(false)} className="btn-primary mt-6 w-full">
            Tampilkan {filtered.length} produk
          </button>
        </Modal>
      )}

      {loading ? (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-4" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] rounded-2xl bg-ink-100" />
              <div className="mt-3 h-4 w-3/4 rounded bg-ink-100" />
              <div className="mt-2 h-4 w-1/3 rounded bg-ink-100" />
            </div>
          ))}
        </div>
      ) : loadError && products.length === 0 ? (
        <div className="mt-8">
          <Alert>{loadError}</Alert>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-ink-200 py-16 text-center">
          <p className="font-semibold">Tidak ada produk yang cocok</p>
          <p className="mt-1 text-sm text-ink-500">Coba kata kunci atau filter lain.</p>
          <button
            type="button"
            onClick={() => setParams({}, { replace: true })}
            className="btn-secondary mt-4"
          >
            Atur ulang filter
          </button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.productId} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
