import { callGas, sendError, sendJson } from './_lib/gas.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Metode tidak didukung.' });
  }
  try {
    const data = await callGas('getProducts', {});
    return sendJson(res, 200, { products: data.products });
  } catch (err) {
    return sendError(res, err);
  }
}
