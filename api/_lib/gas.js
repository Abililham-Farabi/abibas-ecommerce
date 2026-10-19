// Helper server-side untuk Vercel Functions. Tidak diimpor frontend.
import { createHash } from 'node:crypto';

const GAS_URL = process.env.APPS_SCRIPT_URL || '';
const SHARED_SECRET = process.env.APPS_SCRIPT_SHARED_SECRET || '';

export function gasConfigured() {
  return Boolean(GAS_URL && SHARED_SECRET);
}

export async function callGas(action, payload = {}) {
  if (!gasConfigured()) {
    const err = new Error(
      'Backend database belum dikonfigurasi (APPS_SCRIPT_URL / APPS_SCRIPT_SHARED_SECRET kosong).',
    );
    err.status = 503;
    throw err;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    let res = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: SHARED_SECRET, action, payload }),
      signal: controller.signal,
      redirect: 'manual',
    });
    // Apps Script menjawab POST dengan 302 menuju script.googleusercontent.com.
    // Bila redirect diikuti otomatis, fetch menurunkan POST menjadi GET dan
    // membuang bodi — doPost tidak akan pernah terpanggil. Hasil asli tersedia
    // lewat GET terpisah ke URL lokasi tersebut, jadi ikuti manual.
    for (let hop = 0; res.status >= 300 && res.status < 400 && hop < 3; hop++) {
      const location = res.headers.get('location');
      if (!location) break;
      res = await fetch(location, { signal: controller.signal, redirect: 'manual' });
    }
    if (res.status >= 300 && res.status < 400) {
      const err = new Error('Respons database tidak valid.');
      err.status = 502;
      throw err;
    }
    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      const err = new Error('Respons database tidak valid.');
      err.status = 502;
      throw err;
    }
    if (!res.ok || !data?.ok) {
      const err = new Error(data?.error || `Database gagal (${res.status}).`);
      err.status = data?.status || res.status || 500;
      throw err;
    }
    return data.data;
  } catch (e) {
    if (e.name === 'AbortError') {
      const err = new Error('Database timeout. Coba lagi.');
      err.status = 504;
      throw err;
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

export function sendJson(res, status, obj) {
  res.status(status).setHeader('Content-Type', 'application/json');
  // Data di balik /api/* bergantung sesi (pesanan, profil) — jangan pernah
  // disimpan di cache browser/CDN, dan jangan dipulihkan basi oleh bfcache.
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.end(JSON.stringify(obj));
}

export function sendError(res, err) {
  const status = err?.status && Number.isInteger(err.status) ? err.status : 500;
  const verbose = status === 503;
  const message =
    status >= 500 && !verbose
      ? 'Terjadi kesalahan server.'
      : err.message || 'Permintaan gagal.';
  sendJson(res, status, { error: message });
}

export function parseCookies(req) {
  const header = req.headers?.cookie || '';
  const out = {};
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx < 0) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  }
  return out;
}

export function sessionCookie(token, req, { clear = false } = {}) {
  const proto = req.headers?.['x-forwarded-proto'] || 'http';
  const secure = proto === 'https' || process.env.VERCEL === '1';
  const parts = [`abibas_session=${clear ? '' : token}`, 'Path=/', 'HttpOnly', 'SameSite=Lax'];
  if (secure) parts.push('Secure');
  parts.push(clear ? 'Max-Age=0' : 'Max-Age=604800');
  return parts.join('; ');
}

export function hashToken(token) {
  return createHash('sha256').update(String(token)).digest('hex');
}

export async function requireSession(req) {
  const { abibas_session: token } = parseCookies(req);
  if (!token) {
    const err = new Error('Sesi tidak ditemukan. Silakan masuk.');
    err.status = 401;
    throw err;
  }
  const data = await callGas('getSession', { tokenHash: hashToken(token) });
  if (!data?.session || !data?.user) {
    const err = new Error('Sesi kedaluwarsa. Silakan masuk ulang.');
    err.status = 401;
    throw err;
  }
  return { token, session: data.session, user: data.user };
}

export function readBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body && typeof req.body === 'object') return resolve(req.body);
    let raw = '';
    req.on('data', (c) => {
      raw += c;
      if (raw.length > 1_000_000) {
        req.destroy();
        reject(new Error('Body terlalu besar.'));
      }
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('Body JSON tidak valid.'));
      }
    });
    req.on('error', reject);
  });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function normEmail(email) {
  return String(email || '').trim().toLowerCase();
}
export function validEmail(email) {
  return EMAIL_RE.test(normEmail(email));
}
