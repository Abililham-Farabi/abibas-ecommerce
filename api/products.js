import { callGas, sendError, sendJson } from './_lib/gas.js';

// Katalog publik dan jarang berubah. Tiga lapis cache:
// 1. memori function (30 dtk) — menghindari panggilan GAS berulang saat instance
//    masih hangat;
// 2. cache CDN Vercel (60 dtk + stale-while-revalidate) — kunjungan berikutnya
//    tidak menyentuh function sama sekali;
// 3. CacheService di GAS (30 dtk).
// Stok di layar boleh telat <=60 dtk; checkout tetap divalidasi atomik di GAS
// sehingga tidak mungkin oversell.
const MEM_TTL_MS = 30_000;
const CACHE_HEADER = 'public, s-maxage=60, stale-while-revalidate=600';

let memory = { at: 0, products: null };
let inflight = null;

function fetchProducts() {
  if (!inflight) {
    inflight = callGas('getProducts', {})
      .then((data) => data.products || [])
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Metode tidak didukung.' });
  }

  if (memory.products && Date.now() - memory.at < MEM_TTL_MS) {
    return sendJson(res, 200, { products: memory.products }, { cacheControl: CACHE_HEADER });
  }

  try {
    const products = await fetchProducts();
    memory = { at: Date.now(), products };
    return sendJson(res, 200, { products }, { cacheControl: CACHE_HEADER });
  } catch (err) {
    // Lebih baik menyajikan salinan terakhir daripada halaman kosong.
    if (memory.products) {
      return sendJson(
        res,
        200,
        { products: memory.products },
        { cacheControl: 'public, s-maxage=10, stale-while-revalidate=120' },
      );
    }
    return sendError(res, err);
  }
}
