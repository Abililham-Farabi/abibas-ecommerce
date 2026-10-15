import {
  callGas,
  readBody,
  requireSession,
  sendError,
  sendJson,
} from '../_lib/gas.js';

const COURIER_COST = { reguler: 15000, ekspres: 28000, hemat: 10000 };
const PAYMENTS = ['transfer', 'qris', 'ewallet'];
const SIZES = ['S', 'M', 'L', 'XL'];

export default async function handler(req, res) {
  try {
    const { user } = await requireSession(req);

    if (req.method === 'GET') {
      const data = await callGas('getOrdersByUser', { userId: user.userId });
      return sendJson(res, 200, { orders: data.orders || [] });
    }

    if (req.method === 'POST') {
      const { items, recipientName, phone, address, courier, paymentMethod } =
        await readBody(req);

      // Validasi input penerima di Vercel (GAS memvalidasi ulang).
      if (!Array.isArray(items) || items.length === 0 || items.length > 20) {
        return sendJson(res, 400, { error: 'Keranjang kosong atau melebihi 20 jenis item.' });
      }
      for (const it of items) {
        if (!it?.productId || !SIZES.includes(it?.size)) {
          return sendJson(res, 400, { error: 'Ukuran tidak valid. Gunakan S, M, L, atau XL.' });
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
