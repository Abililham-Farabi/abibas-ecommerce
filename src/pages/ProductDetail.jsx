import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SizeTable from '../components/SizeTable';
import { Alert, Modal, QtyStepper } from '../components/ui';
import { api } from '../api/client';
import { useCart } from '../context/CartContext';
import { DEMO_PRODUCTS, SIZES, stockOf } from '../data/products.demo';
import { EXCHANGE_POLICY_SHORT } from '../data/couriers';
import { formatRupiah, isDemoMode } from '../utils/format';

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(() =>
    DEMO_PRODUCTS.find((p) => p.productId === id),
  );
  const [size, setSize] = useState('');
  const [qty, setQty] = useState(1);
  const [notice, setNotice] = useState('');
  const [added, setAdded] = useState(false);
  const [error, setError] = useState('');
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    setProduct(DEMO_PRODUCTS.find((p) => p.productId === id));
    setSize('');
    setQty(1);
    setNotice('');
    setError('');
    if (isDemoMode()) return;
    api
      .getProducts()
      .then((d) => {
        const found = d.products.find((p) => p.productId === id);
        if (found) setProduct(found);
        else setError('Produk tidak ditemukan.');
      })
      .catch((e) => setError(e.message));
  }, [id]);

  const maxQty = useMemo(
    () => (product && size ? stockOf(product, size) : 0),
    [product, size],
  );

  if (error) {
    return (
      <div className="container-store py-16 text-center">
        <p className="font-semibold">Produk tidak ditemukan</p>
        <p className="mt-1 text-sm text-ink-500">{error}</p>
        <Link to="/katalog" className="btn-secondary mt-6">Kembali ke katalog</Link>
      </div>
    );
  }
  if (!product) return <div className="container-store py-16"><p>Memuat…</p></div>;

  function handleAdd() {
    setNotice('');
    if (!size) {
      setNotice('Pilih ukuran dulu ya — S, M, L, atau XL.');
      return;
    }
    const stok = stockOf(product, size);
    if (stok <= 0 || qty < 1 || qty > stok) {
      setNotice(`Ukuran ${size} tersisa ${stok}. Sesuaikan jumlahnya.`);
      return;
    }
    addItem(product, size, qty);
    setNotice(`${product.name} (${size}) × ${qty} masuk keranjang.`);
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
              className="aspect-[3/4] w-full object-cover"
              onError={(e) => { e.currentTarget.src = '/img/ab-t001.svg'; }}
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

          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm font-semibold">Ukuran</p>
            <button
              type="button"
              onClick={() => setGuideOpen(true)}
              className="text-sm text-ink-500 underline underline-offset-4 hover:text-ink-900"
            >
              Panduan ukuran
            </button>
          </div>
          <div className="mt-3 flex gap-2" role="radiogroup" aria-label="Pilih ukuran">
            {SIZES.map((s) => {
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
          <p className="mt-2 text-xs text-ink-400" aria-live="polite">
            {size
              ? maxQty > 0 ? `Ukuran ${size} tersedia (${maxQty} pcs).` : `Ukuran ${size} habis.`
              : 'Stok tampil per ukuran — yang tercoret sedang habis.'}
          </p>

          <div className="mt-6 flex items-center gap-4">
            <QtyStepper value={qty} min={1} max={Math.max(maxQty, 1)} onChange={(v) => setQty(Math.max(1, v))} />
            <button
              type="button"
              onClick={handleAdd}
              disabled={!size || maxQty <= 0}
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

      {guideOpen && (
        <Modal title="Panduan ukuran (cm)" onClose={() => setGuideOpen(false)}>
          <SizeTable />
          <Link to="/panduan-ukuran" className="link-underline mt-4 inline-block text-sm">
            Buka halaman panduan lengkap →
          </Link>
        </Modal>
      )}
    </div>
  );
}
