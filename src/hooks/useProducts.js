import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api/client';
import { DEMO_PRODUCTS } from '../data/products.demo';
import { isDemoMode } from '../utils/format';

// Cache katalog berlapis di sisi klien:
// - memori modul: dipakai lintas halaman tanpa fetch ulang;
// - sessionStorage: bertahan saat reload/navigasi, umur 5 menit.
// Data tetap di-refresh di belakang layar (stale-while-revalidate), jadi
// tampilan instan tetapi stok cepat menyusul.
const CACHE_KEY = 'abibas_products_cache_v1';
const CACHE_TTL_MS = 5 * 60 * 1000;

let memory = null;
let inflight = null;

function readStored() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.products)) return null;
    return { at: Number(parsed.at) || 0, products: parsed.products };
  } catch {
    return null;
  }
}

function store(products) {
  memory = { at: Date.now(), products };
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(memory));
  } catch {
    /* kuota penuh: cache memori tetap jalan */
  }
}

export function cachedProducts() {
  if (memory) return memory;
  const stored = readStored();
  if (stored && Date.now() - stored.at < CACHE_TTL_MS) {
    memory = stored;
    return stored;
  }
  return null;
}

function loadProducts() {
  if (!inflight) {
    inflight = api
      .getProducts()
      .then((d) => {
        const products = d.products || [];
        store(products);
        return products;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export function useProducts() {
  const demo = isDemoMode();
  const [products, setProducts] = useState(() =>
    demo ? DEMO_PRODUCTS : cachedProducts()?.products || [],
  );
  const [loading, setLoading] = useState(() => !demo && !cachedProducts());
  const [error, setError] = useState('');
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    if (demo) return DEMO_PRODUCTS;
    try {
      const next = await loadProducts();
      if (mounted.current) {
        setProducts(next);
        setError('');
      }
      return next;
    } catch (e) {
      if (mounted.current) setError(e.message || 'Gagal memuat produk dari database.');
      throw e;
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [demo]);

  useEffect(() => {
    mounted.current = true;
    // Ditunda satu tick: menghindari permintaan ganda saat StrictMode dan
    // membiarkan cache tampil lebih dulu.
    const timer = window.setTimeout(() => {
      if (!demo) refresh().catch(() => {});
    }, 0);
    return () => {
      window.clearTimeout(timer);
      mounted.current = false;
    };
  }, [demo, refresh]);

  return { products, loading, error, refresh };
}
