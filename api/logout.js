import { callGas, hashToken, parseCookies, sendJson, sessionCookie } from './_lib/gas.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Metode tidak didukung.' });
  }
  try {
    const { abibas_session: token } = parseCookies(req);
    if (token) {
      await callGas('revokeSession', { tokenHash: hashToken(token) });
    }
  } catch {
    /* logout tetap berhasil walau revoke gagal */
  }
  res.setHeader('Set-Cookie', sessionCookie('', req, { clear: true }));
  return sendJson(res, 200, { ok: true });
}
