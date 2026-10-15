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

export function totalStock(p) {
  return ['S', 'M', 'L', 'XL'].reduce((a, s) => a + Number(p?.[`stock${s}`] ?? 0), 0);
}

export function isDemoMode() {
  return (import.meta.env.VITE_DATA_MODE || 'demo').toLowerCase() !== 'sheets';
}
