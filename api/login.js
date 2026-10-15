import { randomBytes, scrypt as _scrypt, timingSafeEqual } from 'node:crypto';
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

async function verify(password, stored) {
  try {
    const [, , salt, hex] = String(stored).split('$');
    const derived = await scrypt(String(password), salt, 64);
    const a = Buffer.from(derived.toString('hex'), 'hex');
    const b = Buffer.from(hex, 'hex');
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Metode tidak didukung.' });
  }
  try {
    const { email, password } = await readBody(req);
    const cleanEmail = normEmail(email);
    if (!validEmail(cleanEmail) || !password) {
      return sendJson(res, 400, { error: 'Email atau kata sandi salah.' });
    }
    const { user } = await callGas('getUserByEmail', { email: cleanEmail });
    const ok = user && (await verify(password, user.passwordHash));
    if (!ok) {
      return sendJson(res, 401, { error: 'Email atau kata sandi salah.' });
    }

    const token = randomBytes(32).toString('hex');
    const now = new Date();
    await callGas('createSession', {
      sessionId: newId('ses'),
      userId: user.userId,
      tokenHash: hashToken(token),
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 7 * 24 * 3600 * 1000).toISOString(),
    });

    res.setHeader('Set-Cookie', sessionCookie(token, req));
    return sendJson(res, 200, {
      user: { userId: user.userId, name: user.name, email: user.email },
    });
  } catch (err) {
    return sendError(res, err);
  }
}
