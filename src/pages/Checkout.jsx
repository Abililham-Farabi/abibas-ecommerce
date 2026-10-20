import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CostSummary from '../components/CostSummary';
import { Alert, FieldError } from '../components/ui';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { COURIERS, EXCHANGE_POLICY_SHORT, PAYMENT_METHODS } from '../data/couriers';
import { validateCheckout } from '../utils/validate';
import { formatRupiah, isDemoMode, sizeLabel } from '../utils/format';

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    recipientName: user?.name || '',
    phone: '',
    address: '',
    courier: 'reguler',
    paymentMethod: 'transfer',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);

  const courier = useMemo(
    () => COURIERS.find((c) => c.id === form.courier) || COURIERS[0],
    [form.courier],
  );
  const total = subtotal + courier.cost;

  if (items.length === 0) {
    return (
      <div className="container-store py-16 text-center">
        <h1 className="font-display text-2xl font-bold">Checkout</h1>
        <p className="mt-2 text-sm text-ink-500">Keranjangmu kosong.</p>
        <Link to="/katalog" className="btn-primary mt-6">Kembali ke katalog</Link>
      </div>
    );
  }

  async function onSubmit(e) {
    e.preventDefault();
    setServerError('');
    const v = validateCheckout(form);
    if (!agreed) v.agreed = 'Centang persetujuan total dulu ya.';
    setErrors(v);
    if (Object.keys(v).length > 0) return;
    setBusy(true);
    try {
      if (isDemoMode()) {
        const orders = JSON.parse(localStorage.getItem('abibas_demo_orders_v1') || '[]');
        const order = {
          orderId: `DEMO-${Date.now()}`,
          userId: user.userId,
          items: items.map((i) => ({
            productId: i.productId,
            productNameSnapshot: i.name,
            size: i.size,
            quantity: i.qty,
            unitPrice: i.price,
            subtotal: i.qty * Number(i.price),
          })),
          ...form,
          shippingCost: courier.cost,
          subtotal,
          total,
          paymentStatus: 'menunggu_pembayaran_simulasi',
          orderStatus: 'menunggu_pembayaran_simulasi',
          createdAt: new Date().toISOString(),
        };
        orders.push(order);
        localStorage.setItem('abibas_demo_orders_v1', JSON.stringify(orders));
        clear();
        navigate(`/pesanan/${order.orderId}`);
        return;
      }
      const data = await api.createOrder({
        items: items.map((i) => ({ productId: i.productId, size: i.size, quantity: i.qty })),
        ...form,
      });
      clear();
      navigate(`/pesanan/${data.order.orderId}`);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container-store py-8">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Checkout</h1>

      <form onSubmit={onSubmit} className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]" noValidate>
        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="font-display text-base font-bold">Alamat pengiriman</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="co-name">Nama penerima</label>
                <input id="co-name" value={form.recipientName} onChange={(e) => setForm({ ...form, recipientName: e.target.value })} className="input" autoComplete="name" />
                <FieldError message={errors.recipientName} />
              </div>
              <div>
                <label className="label" htmlFor="co-phone">No. HP</label>
                <input id="co-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="08xxxxxxxxxx" inputMode="tel" className="input" autoComplete="tel" />
                <FieldError message={errors.phone} />
              </div>
            </div>
            <div className="mt-4">
              <label className="label" htmlFor="co-address">Alamat lengkap</label>
              <textarea id="co-address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={3} placeholder="Jalan, nomor, kota, kode pos" className="input" autoComplete="street-address" />
              <FieldError message={errors.address} />
            </div>
          </section>

          <section className="card p-6">
            <h2 className="font-display text-base font-bold">Kurir</h2>
            <div className="mt-4 space-y-2" role="radiogroup" aria-label="Pilih kurir">
              {COURIERS.map((c) => (
                <label key={c.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm transition ${form.courier === c.id ? 'border-ink-900 bg-ink-50' : 'border-ink-200 hover:border-ink-400'}`}>
                  <input type="radio" name="courier" checked={form.courier === c.id} onChange={() => setForm({ ...form, courier: c.id })} className="accent-black" />
                  <span className="flex-1">{c.name}</span>
                  <span className="font-semibold">{formatRupiah(c.cost)}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="card p-6">
            <h2 className="font-display text-base font-bold">Pembayaran</h2>
            <div className="mt-4 space-y-2" role="radiogroup" aria-label="Pilih metode pembayaran">
              {PAYMENT_METHODS.map((m) => (
                <label key={m.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm transition ${form.paymentMethod === m.id ? 'border-ink-900 bg-ink-50' : 'border-ink-200 hover:border-ink-400'}`}>
                  <input type="radio" name="paymentMethod" checked={form.paymentMethod === m.id} onChange={() => setForm({ ...form, paymentMethod: m.id })} className="accent-black" />
                  <span className="flex-1">
                    <span className="font-medium">{m.name}</span>
                    <span className="block text-xs text-ink-400">{m.hint}</span>
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-3 text-xs text-ink-400">Pembayaran dalam demo ini simulasi — tidak memproses uang nyata.</p>
          </section>
        </div>

        <aside className="card h-fit p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-base font-bold">Ringkasan pesanan</h2>
          <ul className="mt-4 space-y-3">
            {items.map((i) => (
              <li key={i.key} className="flex items-center gap-3">
                <img src={i.imageUrl} alt="" aria-hidden="true" onError={(e) => { e.currentTarget.src = '/img/placeholder.svg'; }} className="h-12 w-10 rounded-lg bg-ink-100 object-cover" />
                <span className="min-w-0 flex-1 truncate text-sm">{i.name}{sizeLabel(i.size) ? ` (${i.size})` : ''} <span className="text-ink-400">× {i.qty}</span></span>
                <span className="text-sm font-medium">{formatRupiah(i.qty * Number(i.price))}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-ink-200/70 pt-4">
            <CostSummary subtotal={subtotal} shippingCost={courier.cost} />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-ink-400">{EXCHANGE_POLICY_SHORT}</p>
          <label className="mt-3 flex cursor-pointer items-start gap-2 text-xs leading-relaxed">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 accent-black" />
            <span>Saya setuju membayar total {formatRupiah(total)} sesuai rincian di atas.</span>
          </label>
          <FieldError message={errors.agreed} />
          {serverError && <div className="mt-3"><Alert>{serverError}</Alert></div>}
          <button type="submit" disabled={busy} className="btn-primary mt-4 w-full">
            {busy ? 'Menyimpan…' : `Buat pesanan · ${formatRupiah(total)}`}
          </button>
        </aside>
      </form>
    </div>
  );
}
