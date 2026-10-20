import { Link } from 'react-router-dom';
import CostSummary from '../components/CostSummary';
import { QtyStepper } from '../components/ui';
import { useCart } from '../context/CartContext';
import { formatRupiah, sizeLabel } from '../utils/format';

export default function Cart() {
  const { items, setQty, removeItem, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="container-store py-16 text-center">
        <h1 className="font-display text-2xl font-bold">Keranjang kosong</h1>
        <p className="mt-2 text-sm text-ink-500">Yuk, mulai isi dengan perlengkapan larimu.</p>
        <Link to="/katalog" className="btn-primary mt-6">Lihat katalog</Link>
      </div>
    );
  }

  return (
    <div className="container-store py-8">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Keranjang</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <ul className="divide-y divide-ink-200/70 border-y border-ink-200/70">
          {items.map((i) => (
            <li key={i.key} className="flex gap-4 py-5">
              <img
                src={i.imageUrl}
                alt=""
                aria-hidden="true"
                onError={(e) => { e.currentTarget.src = '/img/placeholder.svg'; }}
                className="h-24 w-20 shrink-0 rounded-xl bg-ink-100 object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{i.name}</p>
                {sizeLabel(i.size) && (
                  <p className="mt-0.5 text-xs text-ink-400">Ukuran {i.size}</p>
                )}
                <p className="mt-0.5 text-xs text-ink-400">{formatRupiah(i.price)} / pcs</p>
                <div className="mt-3 flex items-center gap-3">
                  <QtyStepper small value={i.qty} min={0} max={20} onChange={(v) => setQty(i.key, v)} />
                  <button
                    type="button"
                    onClick={() => removeItem(i.key)}
                    className="text-xs text-ink-400 underline underline-offset-4 hover:text-red-600"
                  >
                    Hapus
                  </button>
                </div>
              </div>
              <p className="text-sm font-bold">{formatRupiah(i.qty * Number(i.price))}</p>
            </li>
          ))}
        </ul>

        <aside className="card h-fit p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-base font-bold">Ringkasan</h2>
          <div className="mt-4">
            <CostSummary subtotal={subtotal} shippingCost={0} />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-ink-400">
            Ongkir dihitung di langkah berikutnya. Harga &amp; stok dicek ulang
            saat checkout.
          </p>
          <Link to="/checkout" className="btn-primary mt-5 w-full">
            Lanjut ke checkout
          </Link>
          <Link to="/katalog" className="mt-2 block text-center text-sm text-ink-500 hover:text-ink-900">
            Lanjut belanja
          </Link>
        </aside>
      </div>
    </div>
  );
}
