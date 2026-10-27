import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-ink-200/70 bg-white">
      <div className="container-store grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="font-display text-lg font-bold">Abibas</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-500">
            Perlengkapan lari brand sendiri — sepatu, baju, celana, jam, gel,
            dan botol. Harga jelas, pesanan terpantau sampai tiba.
          </p>
        </div>
        <nav aria-label="Belanja">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Belanja</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="hover:underline" to="/katalog">Semua produk</Link></li>
            <li><Link className="hover:underline" to="/katalog?kat=Sepatu%20lari">Sepatu lari</Link></li>
            <li><Link className="hover:underline" to="/katalog?kat=Baju%20lari">Baju lari</Link></li>
            <li><Link className="hover:underline" to="/katalog?kat=Celana%20lari">Celana lari</Link></li>
            <li><Link className="hover:underline" to="/katalog?kat=Jam">Jam</Link></li>
            <li><Link className="hover:underline" to="/katalog?kat=Gel">Gel</Link></li>
            <li><Link className="hover:underline" to="/katalog?kat=Botol">Botol</Link></li>
          </ul>
        </nav>
        <nav aria-label="Bantuan">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Bantuan</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="hover:underline" to="/pesanan">Lacak pesanan</Link></li>
            <li><Link className="hover:underline" to="/keranjang">Keranjang</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-ink-200/70">
        <p className="container-store py-5 text-xs text-ink-400">
          © 2026 Abibas — demo akademik. Pembayaran &amp; pengiriman simulasi,
          tidak memproses uang nyata.
        </p>
      </div>
    </footer>
  );
}
