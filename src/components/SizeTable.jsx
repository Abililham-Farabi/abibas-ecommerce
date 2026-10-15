import { SIZE_GUIDE_ROWS, SIZE_GUIDE_STEPS } from '../data/sizeGuide';

export function SizeGuideTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[280px] text-sm">
        <thead>
          <tr className="border-b border-ink-200 text-left">
            <th scope="col" className="py-2.5 pr-4 font-semibold">Ukuran</th>
            <th scope="col" className="py-2.5 pr-4 text-right font-semibold">Lebar (cm)</th>
            <th scope="col" className="py-2.5 text-right font-semibold">Panjang (cm)</th>
          </tr>
        </thead>
        <tbody>
          {SIZE_GUIDE_ROWS.map((r) => (
            <tr key={r.size} className="border-b border-ink-100 last:border-0">
              <td className="py-2.5 pr-4 font-semibold">{r.size}</td>
              <td className="py-2.5 pr-4 text-right">{r.lebar}</td>
              <td className="py-2.5 text-right">{r.panjang}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SizeGuideSteps() {
  return (
    <ol className="list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-ink-600">
      {SIZE_GUIDE_STEPS.map((s) => (
        <li key={s}>{s}</li>
      ))}
    </ol>
  );
}

// Versi modal/drawer untuk halaman produk.
export default function SizeTable({ compact = false }) {
  return (
    <section aria-label="Panduan ukuran">
      <p className="text-xs text-ink-400">
        Nilai contoh — ukur pakaian favoritmu dan bandingkan sebelum memilih.
      </p>
      <div className="mt-2">
        <SizeGuideTable />
      </div>
      {!compact && (
        <div className="mt-3">
          <SizeGuideSteps />
        </div>
      )}
    </section>
  );
}
