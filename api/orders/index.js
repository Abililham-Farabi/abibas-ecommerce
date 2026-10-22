import {
  callGas,
  hashToken,
  parseCookies,
  readBody,
  requireSession,
  sendError,
  sendJson,
} from '../_lib/gas.js';

const COURIER_COST = { reguler: 15000, ekspres: 28000, hemat: 10000 };
const PAYMENTS = ['transfer', 'qris', 'ewallet'];
// Harus sama dengan SIZE_TYPES di src/utils/format.js dan apps-script/Code.gs.
// Validasi per produk (sizeType) tetap dilakukan GAS; di sini hanya gerbang awal.
const SIZES = [
  'S', 'M', 'L', 'XL',
  '39', '40', '41', '42', '43', '44',
  'ALL',
];

export default async function handler(req, res) {
  try {
    // GET: sesi + daftar pesanan dalam satu panggilan GAS (hemat 1 eksekusi).
    if (req.method === 'GET') {
      const { abibas_session: token } = parseCookies(req);
      if (!token) {
        return sendJson(res, 401, { error: 'Sesi tidak ditemukan. Silakan masuk.' });
      }
      const data = await callGas('getOrdersWithSession', { tokenHash: hashToken(token) });
      if (!data?.session || !data?.user) {
        return sendJson(res, 401, { error: 'Sesi kedaluwarsa. Silakan masuk ulang.' });
      }
      return sendJson(res, 200, { orders: data.orders || [], user: data.user });
    }

    const { user } = await requireSession(req);

    if (req.method === 'POST') {
      const { items, recipientName, phone, address, courier, paymentMethod } =
        await readBody(req);

      // Validasi input penerima di Vercel (GAS memvalidasi ulang).
      if (!Array.isArray(items) || items.length === 0 || items.length > 20) {
        return sendJson(res, 400, { error: 'Keranjang kosong atau melebihi 20 jenis item.' });
      }
      for (const it of items) {
        if (!it?.productId || !SIZES.includes(it?.size)) {
          return sendJson(res, 400, { error: 'Ukuran tidak valid. Gunakan S–XL, 39–44, atau satu ukuran.' });
        }
        const q = Number(it?.quantity);
        if (!Number.isInteger(q) || q < 1 || q > 20) {
          return sendJson(res, 400, { error: 'Kuantitas harus 1–20 per item.' });
        }
      }
      if (!recipientName || String(recipientName).trim().length < 3) {
        return sendJson(res, 400, { error: 'Nama penerima minimal 3 karakter.' });
      }
      if (!phone || !/^[0-9+\-\s]{9,16}$/.test(String(phone).trim())) {
        return sendJson(res, 400, { error: 'Nomor HP 9–16 digit angka.' });
      }
      if (!address || String(address).trim().length < 10) {
        return sendJson(res, 400, { error: 'Alamat minimal 10 karakter.' });
      }
      if (!COURIER_COST[courier]) {
        return sendJson(res, 400, { error: 'Kurir tidak valid.' });
      }
      if (!PAYMENTS.includes(paymentMethod)) {
        return sendJson(res, 400, { error: 'Metode pembayaran tidak valid.' });
      }

      // Harga & stok dihitung ulang di GAS (sumber kebenaran). userId dari sesi.
      const data = await callGas('createOrderAtomic', {
        userId: user.userId,
        items: items.map((it) => ({
          productId: String(it.productId),
          size: it.size,
          quantity: Number(it.quantity),
        })),
        recipientName: String(recipientName).trim(),
        phone: String(phone).trim(),
        address: String(address).trim(),
        courier,
        paymentMethod,
      });
      return sendJson(res, 201, { order: data.order });
    }

    return sendJson(res, 405, { error: 'Metode tidak didukung.' });
  } catch (err) {
    return sendError(res, err);
  }
}
