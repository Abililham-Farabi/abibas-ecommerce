import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert, OrderStatus } from '../components/ui';
import { api } from '../api/client';
import { formatDate, formatRupiah, isDemoMode } from '../utils/format';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
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

  if (error) {
    return (
      <div className="container-store max-w-2xl py-16 text-center">
        <Alert>{error}</Alert>
        <Link to="/pesanan" className="link-underline mt-4 inline-block text-sm">Kembali ke pesanan saya</Link>
      </div>
    );
  }
  if (!order) return <div className="container-store py-16"><p>Memuat pesanan…</p></div>;

  return (
    <div className="container-store max-w-2xl py-8">
      <Link to="/pesanan" className="text-sm text-ink-500 hover:text-ink-900">← Semua pesanan</Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-bold">{order.orderId}</h1>
      </div>
      <p className="mt-1 text-sm text-ink-400">{formatDate(order.createdAt)}</p>
      <div className="mt-2 flex flex-wrap gap-4">
        <OrderStatus status={order.orderStatus} />
        <OrderStatus status={order.paymentStatus} suffix=" (simulasi)" />
      </div>

      <section className="card mt-6 p-6" aria-label="Item pesanan">
        <h2 className="font-display text-base font-bold">Item</h2>
        <ul className="mt-4 divide-y divide-ink-100">
          {(order.items || []).map((it, idx) => (
            <li key={idx} className="flex items-center justify-between gap-3 py-3 text-sm">
              <span className="min-w-0">
                <span className="block truncate font-medium">{it.productNameSnapshot || it.productId}</span>
                <span className="text-xs text-ink-400">Ukuran {it.size} × {it.quantity}</span>
              </span>
              <span className="font-medium">{formatRupiah(it.subtotal)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1.5 border-t border-ink-200/70 pt-4 text-sm">
          <div className="flex justify-between text-ink-600"><dt>Subtotal</dt><dd className="text-ink-900">{formatRupiah(order.subtotal)}</dd></div>
          <div className="flex justify-between text-ink-600"><dt>Ongkir</dt><dd className="text-ink-900">{formatRupiah(order.shippingCost)}</dd></div>
          <div className="flex justify-between text-base font-bold"><dt>Total</dt><dd>{formatRupiah(order.total)}</dd></div>
        </dl>
      </section>

      <section className="card mt-4 p-6 text-sm" aria-label="Pengiriman">
        <h2 className="font-display text-base font-bold">Pengiriman</h2>
        <p className="mt-3 font-medium">{order.recipientName} · {order.phone}</p>
        <p className="mt-1 text-ink-600">{order.address}</p>
        <p className="mt-1 text-ink-600">Kurir: {order.courier} · Pembayaran: {order.paymentMethod} (simulasi)</p>
      </section>
    </div>
  );
}
