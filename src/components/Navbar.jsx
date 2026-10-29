import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const CATS = [
  { label: 'Semua', to: '/katalog' },
  { label: 'Sepatu', to: '/katalog?kat=Sepatu%20lari' },
  { label: 'Baju', to: '/katalog?kat=Baju%20lari' },
  { label: 'Celana', to: '/katalog?kat=Celana%20lari' },
  { label: 'Jam', to: '/katalog?kat=Jam' },
  { label: 'Gel', to: '/katalog?kat=Gel' },
  { label: 'Botol', to: '/katalog?kat=Botol' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  function search(e) {
    e.preventDefault();
    navigate(q.trim() ? `/katalog?q=${encodeURIComponent(q.trim())}` : '/katalog');
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200/70 bg-[#fafaf8]/95 backdrop-blur">
      <div className="hidden border-b border-ink-200/60 md:block">
        <nav className="container-store flex items-center justify-end gap-5 py-1.5 text-xs text-ink-500" aria-label="Bantuan">
          <Link to="/pesanan" className="hover:text-ink-900">Lacak Pesanan</Link>
        </nav>
      </div>
      <div className="container-store">
        <div className="flex h-16 items-center gap-4">
          <button
            type="button"
            className="rounded-lg p-2 hover:bg-ink-100 md:hidden"
            aria-label={open ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          <Link to="/" className="flex shrink-0 items-center" aria-label="Abibas — beranda">
            <img src="/logo-abibas.png" alt="Abibas" className="h-8 w-auto sm:h-9" />
          </Link>

          <nav className="ml-2 hidden items-center gap-1 md:flex" aria-label="Kategori">
            {CATS.map((c) => (
              <Link
                key={c.label}
                to={c.to}
                className="rounded-full px-3 py-1.5 text-sm text-ink-600 hover:bg-ink-100 hover:text-ink-900"
              >
                {c.label}
              </Link>
            ))}
          </nav>

          <form onSubmit={search} className="ml-auto hidden min-w-0 flex-1 max-w-xs items-center lg:flex" role="search">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari sepatu, baju, jam…"
              aria-label="Cari produk"
              className="input rounded-full"
            />
          </form>

          <div className="ml-auto flex items-center gap-1 md:ml-0">
            {user ? (
              <>
                <Link
                  to="/pesanan"
                  className="hidden rounded-full px-3 py-1.5 text-sm text-ink-600 hover:bg-ink-100 sm:block"
                >
                  {user.name.split(' ')[0]}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="hidden rounded-full px-3 py-1.5 text-sm text-ink-600 hover:bg-ink-100 sm:block"
                >
                  Keluar
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="hidden rounded-full px-3 py-1.5 text-sm text-ink-600 hover:bg-ink-100 sm:block"
              >
                Masuk
              </Link>
            )}
            <Link
              to="/keranjang"
              className="relative rounded-full p-2 hover:bg-ink-100"
              aria-label={`Keranjang belanja, ${count} item`}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M3 6h14l-1.2 8.2a1 1 0 0 1-1 .8H5.2a1 1 0 0 1-1-.8L3 6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M7 8V5.5a3 3 0 0 1 6 0V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-clay-500 px-1 text-[11px] font-bold text-white">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>

        <form onSubmit={search} className="pb-3 lg:hidden" role="search">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari sepatu, baju, jam…"
            aria-label="Cari produk"
            className="input rounded-full"
          />
        </form>
      </div>

      {open && (
        <nav className="border-t border-ink-200/70 bg-white md:hidden" aria-label="Menu">
          <div className="container-store flex flex-col py-2">
            {CATS.map((c) => (
              <Link
                key={c.label}
                to={c.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2.5 text-sm font-medium hover:bg-ink-100"
              >
                {c.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/pesanan" onClick={() => setOpen(false)} className="rounded-lg px-2 py-2.5 text-sm hover:bg-ink-100">
                  Pesanan Saya
                </Link>
                <button type="button" onClick={() => { setOpen(false); handleLogout(); }} className="rounded-lg px-2 py-2.5 text-left text-sm hover:bg-ink-100">
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="rounded-lg px-2 py-2.5 text-sm hover:bg-ink-100">
                  Masuk
                </Link>
                <Link to="/register" onClick={() => setOpen(false)} className="rounded-lg px-2 py-2.5 text-sm hover:bg-ink-100">
                  Daftar
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
