export function formatRupiah(n) {
  const v = Number(n ?? 0);
  return 'Rp' + v.toLocaleString('id-ID');
}

export function formatDate(iso) {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(iso);
  }
}

// ---------- ukuran & stok ----------
// Satu sumber kebenaran untuk keluarga ukuran. Harus sama dengan SIZE_TYPES
// di apps-script/Code.gs.
export const SIZE_TYPES = {
  apparel: ['S', 'M', 'L', 'XL'],
  shoes: ['39', '40', '41', '42', '43', '44'],
  one: ['ALL'],
};

// Pilihan filter katalog: ukuran yang bisa dicari pembeli (tanpa 'ALL').
export const SIZES = [...SIZE_TYPES.apparel, ...SIZE_TYPES.shoes];

// Perkiraan panjang kaki (cm) per ukuran sepatu — hanya acuan, bukan jaminan.
export const SHOE_SIZE_CM = {
  39: 24.5,
  40: 25,
  41: 25.5,
  42: 26,
  43: 26.5,
  44: 27,
};

export function sizesFor(product) {
  return SIZE_TYPES[product?.sizeType] || SIZE_TYPES.apparel;
}

export function isOneSize(product) {
  return (product?.sizeType || 'apparel') === 'one';
}

export function stockOf(product, size) {
  if (!product) return 0;
  if (product.stock) return Number(product.stock[size] ?? 0);
  return Number(product[`stock${size}`] ?? 0);
}

export function totalStock(p) {
  if (!p) return 0;
  if (p.stock) return Object.values(p.stock).reduce((a, v) => a + Number(v || 0), 0);
  return SIZES.reduce((a, s) => a + stockOf(p, s), 0);
}

// 'ALL' tidak ditampilkan ke pembeli.
export function sizeLabel(size) {
  return !size || size === 'ALL' ? '' : String(size);
}

export function isDemoMode() {
  return (import.meta.env.VITE_DATA_MODE || 'demo').toLowerCase() !== 'sheets';
}

// ---------- status & lacak pesanan ----------
// Satu sumber kebenaran untuk urutan status, label, dan tampilan lacak.
// Urutan harus sama dengan ORDER_FLOW di apps-script/Code.gs dan api/orders/[id].js.

export const ORDER_FLOW = [
  'menunggu_pembayaran_simulasi',
  'pembayaran_simulasi_dikonfirmasi',
  'diproses',
  'dikirim',
  'selesai',
];

export const ORDER_STATUS = {
  menunggu_pembayaran_simulasi: { label: 'Belum Bayar', dot: 'bg-clay-500', chip: 'chip-warn' },
  pembayaran_simulasi_dikonfirmasi: { label: 'Pembayaran dikonfirmasi', dot: 'bg-ink-700', chip: 'chip-ink' },
  diproses: { label: 'Sedang dikemas', dot: 'bg-ink-600', chip: 'chip-ink' },
  dikirim: { label: 'Dikirim', dot: 'bg-ink-900', chip: 'chip-ink' },
  selesai: { label: 'Selesai', dot: 'bg-ink-900', chip: 'chip-ink' },
  dibatalkan: { label: 'Dibatalkan', dot: 'bg-ink-300', chip: 'chip-muted' },
};

export function orderStatusMeta(status) {
  return ORDER_STATUS[status] || { label: status || 'Tidak diketahui', dot: 'bg-ink-300', chip: 'chip-muted' };
}

// Tile filter ala aplikasi belanja: Belum Bayar / Dikemas / Dikirim / Selesai.
export const ORDER_TILES = [
  { key: 'belum_bayar', label: 'Belum Bayar', statuses: ['menunggu_pembayaran_simulasi'] },
  { key: 'dikemas', label: 'Dikemas', statuses: ['pembayaran_simulasi_dikonfirmasi', 'diproses'] },
  { key: 'dikirim', label: 'Dikirim', statuses: ['dikirim'] },
  { key: 'selesai', label: 'Selesai', statuses: ['selesai'] },
];

export function orderTileKey(status) {
  const tile = ORDER_TILES.find((t) => t.statuses.includes(status));
  return tile ? tile.key : '';
}

// Tahapan timeline pada halaman lacak.
export const ORDER_STEPS = [
  { status: 'menunggu_pembayaran_simulasi', title: 'Pesanan dibuat', at: 'createdAt', note: 'Pesanan diterima sistem' },
  { status: 'pembayaran_simulasi_dikonfirmasi', title: 'Pembayaran dikonfirmasi', at: 'paidAt', note: 'Pembayaran simulasi diterima' },
  { status: 'diproses', title: 'Sedang dikemas', at: 'packedAt', note: 'Pesanan disiapkan di gudang' },
  { status: 'dikirim', title: 'Dikirim', at: 'shippedAt', note: 'Paket diserahkan ke kurir' },
  { status: 'selesai', title: 'Selesai', at: 'doneAt', note: 'Paket diterima pembeli' },
];

export function nextOrderStatus(status) {
  const i = ORDER_FLOW.indexOf(status);
  return i >= 0 && i < ORDER_FLOW.length - 1 ? ORDER_FLOW[i + 1] : null;
}

export const ORDER_ACTIONS = {
  pembayaran_simulasi_dikonfirmasi: 'Konfirmasi pembayaran',
  diproses: 'Kemas pesanan',
  dikirim: 'Kirim paket',
  selesai: 'Pesanan diterima',
};
