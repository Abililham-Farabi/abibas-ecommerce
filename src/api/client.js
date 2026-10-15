// Satu-satunya modul yang boleh memanggil /api/*. Komponen React
// dilarang memanggil URL Apps Script langsung.
async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'same-origin',
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error('Respons server tidak valid. Coba lagi.');
  }
  if (!res.ok) {
    throw new Error(data?.error || `Permintaan gagal (${res.status}).`);
  }
  return data;
}

export const api = {
  getProducts: () => request('/api/products'),
  register: (payload) => request('/api/register', { method: 'POST', body: payload }),
  login: (payload) => request('/api/login', { method: 'POST', body: payload }),
  logout: () => request('/api/logout', { method: 'POST' }),
  me: () => request('/api/me'),
  getOrders: () => request('/api/orders'),
  getOrderDetail: (id) => request(`/api/orders/${encodeURIComponent(id)}`),
  createOrder: (payload) => request('/api/orders', { method: 'POST', body: payload }),
};
