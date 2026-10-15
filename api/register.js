import { randomBytes, scrypt as _scrypt } from 'node:crypto';
import { promisify } from 'node:util';
import {
  callGas,
  hashToken,
  normEmail,
  readBody,
  sendError,
  sendJson,
  sessionCookie,
  validEmail,
} from './_lib/gas.js';

const scrypt = promisify(_scrypt);

function newId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${randomBytes(4).toString('hex')}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Metode tidak didukung.' });
  }
  try {
    const { name, email, password } = await readBody(req);
    const cleanName = String(name || '').trim();
    const cleanEmail = normEmail(email);
    if (cleanName.length < 2) {
      return sendJson(res, 400, { error: 'Nama minimal 2 karakter.' });
    }
    if (!validEmail(cleanEmail)) {
      return sendJson(res, 400, { error: 'Masukkan email yang valid.' });
    }
    if (!password || String(password).length < 8) {
      return sendJson(res, 400, { error: 'Kata sandi minimal 8 karakter.' });
    }

    const existing = await callGas('getUserByEmail', { email: cleanEmail });
    if (existing?.user) {
      return sendJson(res, 409, { error: 'Email sudah terdaftar. Silakan masuk.' });
    }

    const salt = randomBytes(16).toString('hex');
    const derived = await scrypt(String(password), salt, 64);
    const passwordHash = `scrypt$16384$${salt}$${derived.toString('hex')}`;
    const userId = newId('usr');

    await callGas('createUser', {
      userId,
      name: cleanName,
      email: cleanEmail,
      passwordHash,
      createdAt: new Date().toISOString(),
    });

    const token = randomBytes(32).toString('hex');
    const now = new Date();
    await callGas('createSession', {
      sessionId: newId('ses'),
      userId,
      tokenHash: hashToken(token),
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 7 * 24 * 3600 * 1000).toISOString(),
    });

    res.setHeader('Set-Cookie', sessionCookie(token, req));
    return sendJson(res, 201, { user: { userId, name: cleanName, email: cleanEmail } });
  } catch (err) {
    return sendError(res, err);
  }
}
