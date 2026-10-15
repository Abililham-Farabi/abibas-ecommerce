import { formatRupiah } from '../utils/format';

export default function CostSummary({ subtotal, shippingCost }) {
  const total = Number(subtotal) + Number(shippingCost);
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between text-ink-600">
        <dt>Subtotal</dt>
        <dd className="font-medium text-ink-900">{formatRupiah(subtotal)}</dd>
      </div>
      <div className="flex justify-between text-ink-600">
        <dt>Ongkos kirim</dt>
        <dd className="font-medium text-ink-900">{formatRupiah(shippingCost)}</dd>
      </div>
      <div className="flex justify-between border-t border-ink-200 pt-3 text-base font-bold">
        <dt>Total</dt>
        <dd>{formatRupiah(total)}</dd>
      </div>
    </dl>
  );
}
