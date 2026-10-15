import { callGas, requireSession, sendError, sendJson } from '../../_lib/gas.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Metode tidak didukung.' });
  }
  try {
    const { user } = await requireSession(req);
    const { id } = req.query || {};
    if (!id) return sendJson(res, 400, { error: 'ID pesanan wajib diisi.' });
    const data = await callGas('getOrderWithItems', {
      orderId: String(id),
      userId: user.userId,
    });
    if (!data?.order) {
      return sendJson(res, 404, { error: 'Pesanan tidak ditemukan.' });
    }
    return sendJson(res, 200, { order: data.order });
  } catch (err) {
    return sendError(res, err);
  }
}
