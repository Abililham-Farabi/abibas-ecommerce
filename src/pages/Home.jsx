import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Alert } from '../components/ui';
import { useProducts } from '../hooks/useProducts';

const CATS = [
  { label: 'Sepatu lari', to: '/katalog?kat=Sepatu%20lari', img: '/products/ab-r001.jpg' },
  { label: 'Baju lari', to: '/katalog?kat=Baju%20lari', img: '/products/ab-b001.jpg' },
  { label: 'Celana lari', to: '/katalog?kat=Celana%20lari', img: '/products/ab-c001.jpg' },
  { label: 'Jam', to: '/katalog?kat=Jam', img: '/products/ab-j001.jpg' },
  { label: 'Gel', to: '/katalog?kat=Gel', img: '/products/ab-g001.jpg' },
  { label: 'Botol', to: '/katalog?kat=Botol', img: '/products/ab-w001.jpg' },
];

export default function Home() {
  const { products, error: loadError } = useProducts();

  const featured = products.slice(0, 4);

  return (
    <div>
      {/* Hero campaign */}
      <section className="container-store">
        <div className="mt-4 grid overflow-hidden rounded-3xl bg-ink-900 text-white md:grid-cols-2">
          <div className="flex flex-col justify-center p-8 sm:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-200">
              Koleksi lari 2026
            </p>
            <h1 className="font-display mt-3 text-3xl font-bold leading-tight sm:text-4xl">
              Untuk tiap kilometer.
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70">
              Sepatu, baju, celana, jam, gel, dan botol lari — mulai Rp25 ribu.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/katalog"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink-900 hover:bg-ink-100"
              >
                Belanja sekarang
              </Link>
            </div>
          </div>
          <div className="min-h-56 md:min-h-full">
            <img
              src="/products/hero.jpg"
              alt="Pelari berlatih di lintasan"
              width="1200"
              height="900"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="h-56 w-full object-cover md:h-full md:min-h-[340px]"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        </div>
      </section>

      {/* Kategori */}
      <section className="container-store mt-12">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-xl font-bold">Belanja per kategori</h2>
          <Link to="/katalog" className="text-sm font-medium text-ink-500 hover:text-ink-900">
            Semua produk →
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          {CATS.map((c) => (
            <Link key={c.label} to={c.to} className="group">
              <div className="overflow-hidden rounded-2xl bg-ink-100">
                <img
                  src={c.img}
                  alt={c.label}
                  width="900"
                  height="1200"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => { e.currentTarget.src = '/img/placeholder.svg'; }}
                  className="aspect-[3/4] w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <p className="mt-2 text-sm font-semibold">{c.label}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Produk pilihan */}
      <section className="container-store mt-12">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-xl font-bold">Pilihan minggu ini</h2>
          <Link to="/katalog" className="text-sm font-medium text-ink-500 hover:text-ink-900">
            Lihat semua →
          </Link>
        </div>
        {loadError ? (
          <div className="mt-5">
            <Alert>{loadError}</Alert>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.productId} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Kampanye: sepatu */}
      <section className="container-store mt-14">
        <div className="relative overflow-hidden rounded-3xl">
          <img
            src="/campaigns/campaign-track.jpg"
            alt="Pelari bersiap di starting block lintasan"
            width="1200"
            height="675"
            loading="lazy"
            decoding="async"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
            className="h-72 w-full object-cover sm:h-96"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" aria-hidden="true" />
          <div className="absolute bottom-0 max-w-md p-6 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
              Mulai dari 5K
            </p>
            <h2 className="font-display mt-2 text-2xl font-bold text-white sm:text-3xl">
              Sepatu yang ikut ritmemu.
            </h2>
            <p className="mt-2 text-sm text-white/80">
              Daily trainer, tempo, dan trail — pilih sesuai jalur latihanmu.
            </p>
            <Link
              to="/katalog?kat=Sepatu%20lari"
              className="mt-4 inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink-900 hover:bg-ink-100"
            >
              Lihat sepatu
            </Link>
          </div>
        </div>
      </section>

      {/* Kampanye: bekal lari */}
      <section className="container-store mt-6">
        <div className="grid overflow-hidden rounded-3xl bg-ink-100 md:grid-cols-2">
          <div className="order-2 flex flex-col justify-center p-8 sm:p-12 md:order-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-500">
              Bekal lari
            </p>
            <h2 className="font-display mt-2 text-2xl font-bold sm:text-3xl">
              Gel dan botol untuk jarak jauh.
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-500">
              Energi tiap 45 menit dan hidrasi yang gampang dijangkau — bekal
              kecil yang bikin long run lebih tenang.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/katalog?kat=Gel"
                className="rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white hover:bg-ink-700"
              >
                Lihat gel
              </Link>
              <Link
                to="/katalog?kat=Botol"
                className="rounded-full border border-ink-300 px-6 py-3 text-sm font-semibold text-ink-900 hover:border-ink-900"
              >
                Lihat botol
              </Link>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <img
              src="/campaigns/campaign-gear.jpg"
              alt="Pelari membawa botol minum saat berlari"
              width="1200"
              height="675"
              loading="lazy"
              decoding="async"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
              className="h-64 w-full object-cover md:h-full md:min-h-[320px]"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
