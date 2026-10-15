import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container-store py-20 text-center">
      <h1 className="font-display text-3xl font-bold">Halaman tidak ditemukan</h1>
      <p className="mt-2 text-sm text-ink-500">Alamat yang kamu buka tidak ada.</p>
      <Link to="/" className="btn-primary mt-6">Kembali ke beranda</Link>
    </div>
  );
}
