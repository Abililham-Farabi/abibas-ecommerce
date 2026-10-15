import { requireSession, sendError, sendJson } from './_lib/gas.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Metode tidak didukung.' });
  }
  try {
    const { user } = await requireSession(req);
    return sendJson(res, 200, {
      user: { userId: user.userId, name: user.name, email: user.email },
    });
  } catch (err) {
    return sendError(res, err);
  }
}
