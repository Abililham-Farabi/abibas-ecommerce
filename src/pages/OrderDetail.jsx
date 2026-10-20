import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert, OrderStatus, OrderTimeline, StatusChip } from '../components/ui';
import { api } from '../api/client';
import {
  ORDER_ACTIONS,
  ORDER_FLOW,
  ORDER_STEPS,
  formatDate,
  formatRupiah,
  isDemoMode,
  nextOrderStatus,
  sizeLabel,
} from '../utils/format';

const COURIER_LABEL = { reguler: 'Reguler', ekspres: 'Ekspres', hemat: 'Hemat' };
const PAYMENT_LABEL = { transfer: 'Transfer bank', qris: 'QRIS', ewallet: 'E-wallet' };

function orderResi(order) {
  const digits = String(order?.orderId || '').replace(/\D/g, '').slice(-8) || '00000000';
  return `ABI${digits}`;
}

function advanceDemo(orderId, next, atIso) {
  try {
    const list = JSON.parse(localStorage.getItem('abibas_demo_orders_v1') || '[]');
    const i = list.findIndex((o) => o.orderId === orderId);
    if (i < 0) return null;
    const step = ORDER_STEPS.find((s) => s.status === next);
    const updated = { ...list[i], orderStatus: next, updatedAt: atIso };
    if (next === 'pembayaran_simulasi_dikonfirmasi') updated.paymentStatus = next;
    if (step) updated[step.at] = atIso;
    list[i] = updated;
    localStorage.setItem('abibas_demo_orders_v1', JSON.stringify(list));
    return updated;
  } catch {
    return null;
  }
}

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    if (isDemoMode()) {
      const orders = JSON.parse(localStorage.getItem('abibas_demo_orders_v1') || '[]');
      const found = orders.find((o) => o.orderId === id);
      if (found) setOrder(found);
      else setError('Pesanan tidak ditemukan.');
      return;
    }
    api
      .getOrderDetail(id)
      .then((d) => setOrder(d.order))
      .catch((e) => setError(e.message));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function advance() {
    const next = nextOrderStatus(order.orderStatus);
    if (!next) return;
    setBusy(true);
    setError('');
    try {
      if (isDemoMode()) {
        const updated = advanceDemo(order.orderId, next, new Date().toISOString());
        if (!updated) throw new Error('Pesanan tidak ditemukan.');
        setOrder(updated);
      } else {
        const d = await api.updateOrderStatus(order.orderId, next);
        setOrder(d.order);
      }
    } catch (e) {
      setError(e.message);
      load();
    } finally {
      setBusy(false);
    }
  }

  if (error && !order) {
    return (
      <div className="container-store max-w-2xl py-16 text-center">
        <Alert>{error}</Alert>
        <Link to="/pesanan" className="link-underline mt-4 inline-block text-sm">Kembali ke pesanan saya</Link>
      </div>
    );
  }
  if (!order) return <div className="container-store py-16"><p>Memuat pesanan…</p></div>;

  const next = nextOrderStatus(order.orderStatus);
  const stageIdx = ORDER_FLOW.indexOf(order.orderStatus);
  const shipped = stageIdx >= ORDER_FLOW.indexOf('dikirim');
  const cancelled = order.orderStatus === 'dibatalkan';

  return (
    <div className="container-store max-w-2xl py-8">
      <Link to="/pesanan" className="text-sm text-ink-500 hover:text-ink-900">← Semua pesanan</Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-bold">{order.orderId}</h1>
      </div>
      <p className="mt-1 text-sm text-ink-400">{formatDate(order.createdAt)}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <StatusChip status={order.orderStatus} />
        {shipped && !cancelled && (
          <span className="chip chip-muted">Resi {orderResi(order)}</span>
        )}
      </div>

      <section className="card mt-6 p-6" aria-label="Lacak pesanan">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-base font-bold">Lacak pesanan</h2>
          <span className="chip chip-muted">Simulasi</span>
        </div>

        {cancelled ? (
          <p className="mt-3 text-sm text-ink-500">Pesanan ini dibatalkan.</p>
        ) : (
          <>
            <OrderTimeline order={order} />
            {next ? (
              <div className="mt-5 border-t border-ink-100 pt-4">
                <button type="button" onClick={advance} disabled={busy} className="btn-primary w-full sm:w-auto">
                  {busy ? 'Memproses…' : ORDER_ACTIONS[next]}
                </button>
                <p className="mt-2 text-xs text-ink-400">
                  Tombol simulasi demo — mengubah status pesanan tanpa pembayaran/pengiriman nyata.
                </p>
              </div>
            ) : (
              <p className="mt-5 border-t border-ink-100 pt-4 text-xs text-ink-400">
                Pesanan selesai. Terima kasih sudah berbelanja di Abibas.
              </p>
            )}
          </>
        )}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </section>

      <section className="card mt-4 p-6" aria-label="Item pesanan">
        <h2 className="font-display text-base font-bold">Item</h2>
        <ul className="mt-4 divide-y divide-ink-100">
          {(order.items || []).map((it, idx) => (
            <li key={idx} className="flex items-center justify-between gap-3 py-3 text-sm">
              <span className="min-w-0">
                <span className="block truncate font-medium">{it.productNameSnapshot || it.productId}</span>
                <span className="text-xs text-ink-400">
                  {sizeLabel(it.size) ? `Ukuran ${it.size} × ${it.quantity}` : `${it.quantity} pcs`}
                </span>
              </span>
              <span className="font-medium">{formatRupiah(it.subtotal)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1.5 border-t border-ink-200/70 pt-4 text-sm">
          <div className="flex justify-between text-ink-600"><dt>Subtotal</dt><dd className="text-ink-900">{formatRupiah(order.subtotal)}</dd></div>
          <div className="flex justify-between text-ink-600"><dt>Ongkir ({COURIER_LABEL[order.courier] || order.courier})</dt><dd className="text-ink-900">{formatRupiah(order.shippingCost)}</dd></div>
          <div className="flex justify-between text-base font-bold"><dt>Total</dt><dd>{formatRupiah(order.total)}</dd></div>
        </dl>
      </section>

      <section className="card mt-4 p-6 text-sm" aria-label="Pengiriman">
        <h2 className="font-display text-base font-bold">Pengiriman</h2>
        <p className="mt-3 font-medium">{order.recipientName} · {order.phone}</p>
        <p className="mt-1 text-ink-600">{order.address}</p>
        <dl className="mt-3 space-y-1 border-t border-ink-100 pt-3 text-ink-600">
          <div className="flex justify-between"><dt>Kurir</dt><dd className="text-ink-900">{COURIER_LABEL[order.courier] || order.courier}</dd></div>
          <div className="flex justify-between"><dt>No. resi</dt><dd className="text-ink-900">{shipped && !cancelled ? orderResi(order) : '—'}</dd></div>
          <div className="flex justify-between"><dt>Pembayaran</dt><dd className="text-ink-900">{PAYMENT_LABEL[order.paymentMethod] || order.paymentMethod} (simulasi)</dd></div>
        </dl>
        <div className="mt-3 border-t border-ink-100 pt-3">
          <OrderStatus status={order.paymentStatus} suffix=" (simulasi)" />
        </div>
      </section>
    </div>
  );
}
