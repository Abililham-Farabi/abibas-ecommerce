import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert, QtyStepper } from '../components/ui';
import { useCart } from '../context/CartContext';
import { DEMO_PRODUCTS } from '../data/products.demo';
import { EXCHANGE_POLICY_SHORT } from '../data/couriers';
import { useProducts } from '../hooks/useProducts';
import {
  formatRupiah,
  isOneSize,
  SHOE_SIZE_CM,
  sizesFor,
  stockOf,
} from '../utils/format';

function initialSize(product) {
  return isOneSize(product) ? 'ALL' : '';
}

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const { products, error: loadError } = useProducts();
  const product = useMemo(
    () =>
      products.find((p) => p.productId === id) ||
      DEMO_PRODUCTS.find((p) => p.productId === id),
    [products, id],
  );
  const oneSize = isOneSize(product);
  const sizes = sizesFor(product);
  const [size, setSize] = useState(() =>
    initialSize(DEMO_PRODUCTS.find((p) => p.productId === id)),
  );
  const [qty, setQty] = useState(1);
  const [notice, setNotice] = useState('');
  const [added, setAdded] = useState(false);
  const [prevId, setPrevId] = useState(id);

  // Ganti produk = mulai dari pilihan awal; diterapkan saat render agar tidak
  // sempat menampilkan ukuran/qty milik produk sebelumnya.
  if (prevId !== id) {
    setPrevId(id);
    setSize(initialSize(DEMO_PRODUCTS.find((p) => p.productId === id)));
    setQty(1);
    setNotice('');
    setAdded(false);
  }

  const missing = products.length > 0 && !products.some((p) => p.productId === id);

  // Stok bisa berbeda dari data demo: bila ukuran terpilih habis, ukuran
  // efektif dikosongkan agar pengguna memilih ulang.
  const activeSize = oneSize
    ? 'ALL'
    : size && stockOf(product, size) > 0
      ? size
      : '';

  const maxQty = useMemo(
    () => (product && activeSize ? stockOf(product, activeSize) : 0),
    [product, activeSize],
  );

  if (missing || (!product && loadError)) {
    return (
      <div className="container-store py-16 text-center">
        <p className="font-semibold">Produk tidak ditemukan</p>
        <p className="mt-1 text-sm text-ink-500">
          {loadError || 'Produk ini tidak ada di katalog.'}
        </p>
        <Link to="/katalog" className="btn-secondary mt-6">Kembali ke katalog</Link>
      </div>
    );
  }
  if (!product) return <div className="container-store py-16"><p>Memuat…</p></div>;

  function handleAdd() {
    setNotice('');
    if (!activeSize) {
      setNotice('Pilih ukuran dulu ya.');
      return;
    }
    const stok = stockOf(product, activeSize);
    if (stok <= 0 || qty < 1 || qty > stok) {
      setNotice(`${oneSize ? 'Stok' : `Ukuran ${size}`} tersisa ${stok}. Sesuaikan jumlahnya.`);
      return;
    }
    addItem(product, activeSize, qty);
    setNotice(`${product.name}${oneSize ? '' : ` (${size})`} × ${qty} masuk keranjang.`);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div className="container-store py-8">
      <nav className="text-sm text-ink-400" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-ink-900">Beranda</Link>
        {' / '}
        <Link to="/katalog" className="hover:text-ink-900">Katalog</Link>
        {' / '}
        <span className="text-ink-900">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-3xl bg-ink-100">
            <img
              src={product.imageUrl}
              alt={product.name}
              width="900"
              height="1200"
              fetchPriority="high"
              decoding="async"
              className="aspect-[3/4] w-full object-cover"
              onError={(e) => { e.currentTarget.src = '/img/placeholder.svg'; }}
            />
          </div>
          <p className="mt-3 text-xs text-ink-400">
            Foto referensi gaya — bukan foto produk aktual.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-clay-500">
            {product.category}
          </p>
          <h1 className="font-display mt-2 text-3xl font-bold leading-tight">{product.name}</h1>
          <p className="mt-3 text-2xl font-bold">{formatRupiah(product.price)}</p>
          <p className="mt-4 text-sm leading-relaxed text-ink-600">{product.description}</p>

          <div className="mt-6">
            <p className="text-sm font-semibold">Ukuran</p>
          </div>

          {oneSize ? (
            <p className="mt-2 text-sm text-ink-600">
              Satu ukuran — tidak perlu memilih ukuran.
            </p>
          ) : (
            <>
              <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Pilih ukuran">
                {sizes.map((s) => {
                  const stok = stockOf(product, s);
                  const out = stok <= 0;
                  const active = size === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      disabled={out}
                      onClick={() => { setSize(s); setQty(1); setNotice(''); }}
                      className={`min-w-14 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                        active
                          ? 'border-ink-900 bg-ink-900 text-white'
                          : 'border-ink-200 bg-white hover:border-ink-900'
                      } ${out ? 'cursor-not-allowed opacity-35 line-through' : ''}`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>

              {product.sizeType === 'shoes' && (
                <p className="mt-2 text-xs text-ink-400">
                  Acuan panjang kaki (perkiraan):{' '}
                  {sizes.map((s) => `${s}≈${SHOE_SIZE_CM[s]} cm`).join(' · ')}
                </p>
              )}

              <p className="mt-2 text-xs text-ink-400" aria-live="polite">
                {size
                  ? maxQty > 0 ? `Ukuran ${size} tersedia (${maxQty} pcs).` : `Ukuran ${size} habis.`
                  : 'Stok tampil per ukuran — yang tercoret sedang habis.'}
              </p>
            </>
          )}

          {oneSize && (
            <p className="mt-2 text-xs text-ink-400" aria-live="polite">
              {maxQty > 0 ? `Stok tersisa ${maxQty} pcs.` : 'Stok habis.'}
            </p>
          )}

          <div className="mt-6 flex items-center gap-4">
            <QtyStepper value={qty} min={1} max={Math.max(maxQty, 1)} onChange={(v) => setQty(Math.max(1, v))} />
            <button
              type="button"
              onClick={handleAdd}
              disabled={!activeSize || maxQty <= 0}
              className={`btn-primary flex-1 ${added ? '!bg-emerald-700' : ''}`}
            >
              {added ? '✓ Masuk keranjang' : 'Tambah ke keranjang'}
            </button>
          </div>
          {notice && <div className="mt-3"><Alert tone={notice.includes('masuk keranjang') ? 'success' : 'info'}>{notice}{notice.includes('masuk keranjang') && (<> <Link to="/keranjang" className="font-semibold underline">Lihat keranjang →</Link></>)}</Alert></div>}

          <div className="mt-6 space-y-3 border-t border-ink-200/70 pt-6 text-sm">
            <div className="flex gap-3">
              <span className="w-28 shrink-0 text-ink-400">Penukaran</span>
              <span>{EXCHANGE_POLICY_SHORT}</span>
            </div>
            <div className="flex gap-3">
              <span className="w-28 shrink-0 text-ink-400">Pembayaran</span>
              <span>Transfer bank, QRIS, e-wallet.</span>
            </div>
            <div className="flex gap-3">
              <span className="w-28 shrink-0 text-ink-400">Pengiriman</span>
              <span>Pilihan kurir + ongkir tampil saat checkout.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
