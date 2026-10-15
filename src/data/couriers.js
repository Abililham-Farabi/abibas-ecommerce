// Kurir & ongkir SIMULASI — bukan API kurir nyata.
export const COURIERS = [
  { id: 'reguler', name: 'Reguler (2–4 hari)', cost: 15000, eta: '2–4 hari' },
  { id: 'ekspres', name: 'Ekspres (1–2 hari)', cost: 28000, eta: '1–2 hari' },
  { id: 'hemat', name: 'Hemat (4–6 hari)', cost: 10000, eta: '4–6 hari' },
];

export const PAYMENT_METHODS = [
  { id: 'transfer', name: 'Transfer bank', hint: 'BCA / BRI / Mandiri (simulasi)' },
  { id: 'qris', name: 'QRIS', hint: 'Kode QR tampil setelah checkout (simulasi)' },
  { id: 'ewallet', name: 'E-wallet', hint: 'GoPay / OVO / DANA (simulasi)' },
];

export const EXCHANGE_POLICY_SHORT =
  'Tukar ukuran gratis 1 kali dalam 7 hari setelah barang diterima, selama label produk masih utuh.';
