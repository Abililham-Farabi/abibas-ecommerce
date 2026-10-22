import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, StatusChip, StatusIcon } from '../components/ui';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  ORDER_ACTIONS,
  ORDER_TILES,
  formatDate,
  formatRupiah,
  isDemoMode,
  nextOrderStatus,
} from '../utils/format';

const CACHE_PREFIX = 'abibas_orders_cache_v1:';

function readDemoOrders() {
  try {
    return JSON.parse(localStorage.getItem('abibas_demo_orders_v1') || '[]');
  } catch {
    return [];
  }
}

function readCached(key) {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(key) || 'null');
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeCached(key, orders) {
  try {
    sessionStorage.setItem(key, JSON.stringify(orders));
  } catch {
    /* kuota penuh: abaikan */
  }
}

export default function Orders() {
  const { user } = useAuth();
  const cacheKey = user ? `${CACHE_PREFIX}${user.userId}` : '';
  const [cachedOrders] = useState(() => (cacheKey ? readCached(cacheKey) : null));
  const [orders, setOrders] = useState(() => cachedOrders || []);
  const [tab, setTab] = useState('semua');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(() => !cachedOrders);
  const lastLoad = useRef(0);

  const load = useCallback(
    ({ silent = false } = {}) => {
      if (isDemoMode()) {
        setOrders(readDemoOrders());
        setLoading(false);
        lastLoad.current = Date.now();
        return;
      }
      if (!silent) setLoading(true);
      return api
        .getOrders()
        .then((d) => {
          setOrders(d.orders || []);
          if (cacheKey) writeCached(cacheKey, d.orders || []);
          setError('');
          lastLoad.current = Date.now();
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    },
    [cacheKey],
  );

  // Salinan terakhir sudah dipakai sebagai state awal (lihat cachedOrders);
  // data segar menyusul di belakang.
  useEffect(() => {
    // Ditunda satu tick agar StrictMode tidak menembak dua permintaan dan
    // salinan cache sempat tampil lebih dulu.
    const timer = window.setTimeout(load, 0);
    // Safari memulihkan halaman dari cache (bfcache) tanpa menjalankan ulang
    // komponen — muat ulang hanya saat benar-benar dipulihkan.
    function onPageShow(event) {
      if (event.persisted) load({ silent: true });
    }
    function onVisible() {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - lastLoad.current < 30000) return;
      load({ silent: true });
    }
    window.addEventListener('pageshow', onPageShow);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('pageshow', onPageShow);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [load]);

  const activeTile = ORDER_TILES.find((t) => t.key === tab);
  const visible = activeTile ? orders.filter((o) => activeTile.statuses.includes(o.orderStatus)) : orders;
  const sorted = [...visible].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

  function countFor(tile) {
    return orders.filter((o) => tile.statuses.includes(o.orderStatus)).length;
  }

  return (
    <div className="container-store max-w-4xl py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Pesanan saya</h1>
        <button
          type="button"
          onClick={() => setTab('semua')}
          className="text-sm font-medium text-ink-600 transition hover:text-ink-900"
        >
          Lihat riwayat lengkap <span aria-hidden="true">›</span>
        </button>
      </div>

      <section className="card mt-5 p-2 sm:p-3" aria-label="Status pesanan">
        <div className="grid grid-cols-4 gap-1 sm:gap-2">
          {ORDER_TILES.map((tile) => {
            const active = tab === tile.key;
            const count = countFor(tile);
            return (
              <button
                key={tile.key}
                type="button"
                aria-pressed={active}
                onClick={() => setTab(active ? 'semua' : tile.key)}
                className={`flex flex-col items-center gap-2 rounded-xl px-2 py-3 transition ${
                  active ? 'bg-ink-900 text-white' : 'text-ink-600 hover:bg-ink-50'
                }`}
              >
                <span className="relative">
                  <StatusIcon name={tile.key} className="h-7 w-7" />
                  {count > 0 && (
                    <span
                      className={`absolute -right-3 -top-2 min-w-[18px] rounded-full px-1 text-center text-[10px] font-bold leading-[18px] ${
                        active ? 'bg-white text-ink-900' : 'bg-clay-500 text-white'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </span>
                <span className="text-[11px] font-semibold sm:text-xs">{tile.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-ink-500">
          {activeTile ? `Menampilkan: ${activeTile.label}` : `Semua pesanan (${orders.length})`}
        </p>
        <button
          type="button"
          onClick={load}
          className="text-xs font-semibold uppercase tracking-wide text-ink-500 transition hover:text-ink-900"
        >
          Muat ulang
        </button>
      </div>

      <Alert>{error}</Alert>

      {loading && orders.length === 0 ? (
        <div className="card mt-4 py-16 text-center text-sm text-ink-500">Memuat pesanan…</div>
      ) : sorted.length === 0 ? (
        <div className="card mt-4 py-16 text-center">
          <p className="font-semibold">{orders.length === 0 ? 'Belum ada pesanan' : 'Tidak ada pesanan di tahap ini'}</p>
          <p className="mt-1 text-sm text-ink-500">
            {orders.length === 0
              ? 'Pesananmu akan muncul di sini setelah checkout.'
              : 'Coba pilih tahap lain atau lihat semua pesanan.'}
          </p>
          {orders.length === 0 ? (
            <Link to="/katalog" className="btn-primary mt-6">Mulai belanja</Link>
          ) : (
            <button type="button" onClick={() => setTab('semua')} className="btn-secondary mt-6">
              Lihat semua pesanan
            </button>
          )}
        </div>
      ) : (
        <ul className="mt-4 space-y-4">
          {sorted.map((o) => {
            const next = nextOrderStatus(o.orderStatus);
            return (
              <li key={o.orderId} className="card overflow-hidden">
                <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-5 py-3">
                  <StatusChip status={o.orderStatus} />
                  <span className="text-xs text-ink-400">{formatDate(o.createdAt)}</span>
                </div>

                <Link to={`/pesanan/${o.orderId}`} className="block px-5 py-4 transition hover:bg-ink-50">
                  <p className="text-sm font-semibold">{o.orderId}</p>
                  <p className="mt-1 text-xs text-ink-400">
                    {o.itemCount != null ? o.itemCount : (o.items || []).length} item · Kurir {o.courier}
                  </p>
                  <p className="mt-3 text-sm font-bold">{formatRupiah(o.total)}</p>
                </Link>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-ink-100 px-5 py-3">
                  <p className="text-xs text-ink-500">
                    {next ? `Berikutnya: ${ORDER_ACTIONS[next]}` : 'Pesanan sudah selesai'}
                  </p>
                  <Link to={`/pesanan/${o.orderId}`} className="btn-primary px-4 py-2 text-xs">
                    Lacak pesanan
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
