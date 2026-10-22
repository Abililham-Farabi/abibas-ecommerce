import {
  callGas,
  hashToken,
  parseCookies,
  readBody,
  requireSession,
  sendError,
  sendJson,
} from '../_lib/gas.js';

// Tahapan lacak pesanan (simulasi). Urutannya wajib sama dengan ORDER_FLOW
// di apps-script/Code.gs; GAS tetap memvalidasi ulang.
const ORDER_FLOW = [
  'menunggu_pembayaran_simulasi',
  'pembayaran_simulasi_dikonfirmasi',
  'diproses',
  'dikirim',
  'selesai',
];

export default async function handler(req, res) {
  try {
    const { id } = req.query || {};
    if (!id) return sendJson(res, 400, { error: 'ID pesanan wajib diisi.' });

    // GET: sesi + detail pesanan dalam satu panggilan GAS.
    if (req.method === 'GET') {
      const { abibas_session: token } = parseCookies(req);
      if (!token) {
        return sendJson(res, 401, { error: 'Sesi tidak ditemukan. Silakan masuk.' });
      }
      const data = await callGas('getOrderWithSession', {
        tokenHash: hashToken(token),
        orderId: String(id),
      });
      if (!data?.session || !data?.user) {
        return sendJson(res, 401, { error: 'Sesi kedaluwarsa. Silakan masuk ulang.' });
      }
      if (!data?.order) {
        return sendJson(res, 404, { error: 'Pesanan tidak ditemukan.' });
      }
      return sendJson(res, 200, { order: data.order });
    }

    const { user } = await requireSession(req);

    if (req.method === 'POST') {
      const { status } = await readBody(req);
      if (!ORDER_FLOW.includes(status)) {
        return sendJson(res, 400, { error: 'Status tidak valid.' });
      }
      const data = await callGas('updateOrderStatus', {
        orderId: String(id),
        userId: user.userId,
        status,
      });
      if (!data?.order) {
        return sendJson(res, 404, { error: 'Pesanan tidak ditemukan.' });
      }
      return sendJson(res, 200, { order: data.order });
    }

    return sendJson(res, 405, { error: 'Metode tidak didukung.' });
  } catch (err) {
    return sendError(res, err);
  }
}
