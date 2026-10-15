import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, OrderStatus } from '../components/ui';
import { api } from '../api/client';
import { formatDate, formatRupiah, isDemoMode } from '../utils/format';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isDemoMode()) {
      try {
        setOrders(JSON.parse(localStorage.getItem('abibas_demo_orders_v1') || '[]'));
      } catch {
        setError('Gagal membaca riwayat pesanan.');
      }
      return;
    }
    api
      .getOrders()
      .then((d) => setOrders(d.orders))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="container-store max-w-4xl py-8">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Pesanan saya</h1>
      <Alert>{error}</Alert>
      {orders.length === 0 && !error ? (
        <div className="card mt-6 py-16 text-center">
          <p className="font-semibold">Belum ada pesanan</p>
          <p className="mt-1 text-sm text-ink-500">Pesananmu akan muncul di sini setelah checkout.</p>
          <Link to="/katalog" className="btn-primary mt-6">Mulai belanja</Link>
        </div>
      ) : (
        <ul className="card mt-6 divide-y divide-ink-200/70">
          {[...orders].reverse().map((o) => (
            <li key={o.orderId}>
              <Link to={`/pesanan/${o.orderId}`} className="flex items-center gap-4 p-5 transition hover:bg-ink-50">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{o.orderId}</p>
                  <p className="mt-0.5 text-xs text-ink-400">
                    {formatDate(o.createdAt)} · {(o.items || []).length} item
                  </p>
                  <div className="mt-1.5">
                    <OrderStatus status={o.orderStatus} />
                  </div>
                </div>
                <p className="text-sm font-bold">{formatRupiah(o.total)}</p>
                <span className="text-ink-300" aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
