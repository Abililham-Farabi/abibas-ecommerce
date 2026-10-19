import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Alert } from '../components/ui';
import { api } from '../api/client';
import { DEMO_PRODUCTS } from '../data/products.demo';
import { isDemoMode } from '../utils/format';

const CATS = [
  { label: 'Kaos', to: '/katalog?kat=Kaos%20oversize', img: '/products/ab-t002.jpg' },
  { label: 'Kemeja', to: '/katalog?kat=Kemeja%20kasual', img: '/products/ab-k002.jpg' },
  { label: 'Hoodie', to: '/katalog?kat=Hoodie', img: '/products/ab-h001.jpg' },
];

export default function Home() {
  const [products, setProducts] = useState(DEMO_PRODUCTS);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (isDemoMode()) return;
    api
      .getProducts()
      .then((d) => setProducts(d.products))
      .catch((e) => {
        setProducts([]);
        setLoadError(e.message || 'Gagal memuat produk dari database.');
      });
  }, []);

  const featured = products.slice(0, 4);

  return (
    <div>
      {/* Hero campaign */}
      <section className="container-store">
        <div className="mt-4 grid overflow-hidden rounded-3xl bg-ink-900 text-white md:grid-cols-2">
          <div className="flex flex-col justify-center p-8 sm:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-200">
              Koleksi kasual 2026
            </p>
            <h1 className="font-display mt-3 text-3xl font-bold leading-tight sm:text-4xl">
              Santai, rapi, pas di badan.
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70">
              Kaos oversize, kemeja kasual, dan hoodie mulai Rp129 ribu.
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
              alt="Suasana rak pakaian Abibas"
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
        <div className="mt-5 grid grid-cols-3 gap-3 sm:gap-4">
          {CATS.map((c) => (
            <Link key={c.label} to={c.to} className="group">
              <div className="overflow-hidden rounded-2xl bg-ink-100">
                <img
                  src={c.img}
                  alt={c.label}
                  loading="lazy"
                  onError={(e) => { e.currentTarget.src = '/img/ab-t001.svg'; }}
                  className="aspect-[3/4] w-full object-cover transition duration-300 group-hover:scale-[1.03] sm:aspect-[4/3]"
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

      {/* Kampanye sekunder: esensial harian */}
      <section className="container-store mt-14">
        <div className="relative overflow-hidden rounded-3xl">
          <img
            src="/campaigns/campaign-street.jpg"
            alt="Rangkaian pakaian esensial digantung rapi"
            loading="lazy"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
            className="h-72 w-full object-cover sm:h-96"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" aria-hidden="true" />
          <div className="absolute bottom-0 max-w-md p-6 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
              Esensial harian
            </p>
            <h2 className="font-display mt-2 text-2xl font-bold text-white sm:text-3xl">
              Satu lemari, banyak acara.
            </h2>
            <p className="mt-2 text-sm text-white/80">
              Potongan santai yang tetap rapi untuk kampus sampai nongkrong.
            </p>
            <Link
              to="/katalog?kat=Kaos%20oversize"
              className="mt-4 inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink-900 hover:bg-ink-100"
            >
              Lihat kaos
            </Link>
          </div>
        </div>
      </section>

      {/* Kampanye sekunder: hoodie */}
      <section className="container-store mt-6">
        <div className="grid overflow-hidden rounded-3xl bg-ink-100 md:grid-cols-2">
          <div className="order-2 flex flex-col justify-center p-8 sm:p-12 md:order-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-500">
              Hangat &amp; santai
            </p>
            <h2 className="font-display mt-2 text-2xl font-bold sm:text-3xl">
              Hoodie untuk hari yang panjang.
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-500">
              Fleece tebal dengan saku kanguru — teman perjalanan dan begadang
              tugas.
            </p>
            <div className="mt-5">
              <Link
                to="/katalog?kat=Hoodie"
                className="rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white hover:bg-ink-700"
              >
                Lihat hoodie
              </Link>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <img
              src="/campaigns/campaign-shop.jpg"
              alt="Gaya belanja kasual dengan hoodie"
              loading="lazy"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
              className="h-64 w-full object-cover md:h-full md:min-h-[320px]"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
