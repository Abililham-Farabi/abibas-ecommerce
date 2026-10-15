import { Link } from 'react-router-dom';
import { formatRupiah, totalStock } from '../utils/format';

function fallback(e) {
  e.currentTarget.src = '/img/ab-t001.svg';
}

export default function ProductCard({ product }) {
  const total = totalStock(product);
  const soldOut = total <= 0;
  return (
    <article className="group">
      <Link
        to={`/produk/${product.productId}`}
        className="block overflow-hidden rounded-2xl bg-ink-100"
        aria-label={product.name}
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          onError={fallback}
          className="aspect-[3/4] w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
      </Link>
      <div className="px-1 pt-3">
        <p className="text-xs text-ink-400">{product.category}</p>
        <Link to={`/produk/${product.productId}`} className="mt-0.5 block text-sm font-medium leading-snug hover:underline">
          {product.name}
        </Link>
        <div className="mt-1 flex items-center justify-between">
          <p className="text-sm font-bold">{formatRupiah(product.price)}</p>
          <p className={`text-xs ${soldOut ? 'text-red-600' : 'text-emerald-700'}`}>
            {soldOut ? 'Habis' : 'Tersedia'}
          </p>
        </div>
      </div>
    </article>
  );
}
