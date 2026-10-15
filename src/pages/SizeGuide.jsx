import { Link } from 'react-router-dom';
import { SizeGuideSteps, SizeGuideTable } from '../components/SizeTable';

export default function SizeGuide() {
  return (
    <div className="container-store max-w-2xl py-8">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Panduan ukuran</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-500">
        Cara memilih: ukur pakaian favoritmu, lalu bandingkan dengan tabel di
        bawah. Kalau hasilnya di antara dua ukuran, ambil yang lebih besar
        untuk potongan oversize. Nilai tabel masih berupa contoh ilustrasi.
      </p>

      <section className="card mt-6 p-6" aria-label="Tabel ukuran">
        <SizeGuideTable />
      </section>

      <section className="card mt-4 p-6" aria-label="Cara mengukur">
        <h2 className="font-display text-base font-bold">Cara mengukur</h2>
        <div className="mt-3">
          <SizeGuideSteps />
        </div>
      </section>

      <section className="card mt-4 p-6 text-sm" aria-label="Penukaran">
        <h2 className="font-display text-base font-bold">Tukar ukuran</h2>
        <p className="mt-2 leading-relaxed text-ink-600">
          Gratis 1 kali dalam 7 hari setelah barang diterima, selama label
          produk masih utuh.
        </p>
        <Link to="/katalog" className="btn-primary mt-4">Kembali belanja</Link>
      </section>
    </div>
  );
}
