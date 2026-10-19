import { useEffect } from 'react';
import { ORDER_FLOW, ORDER_STEPS, formatDate, orderStatusMeta } from '../utils/format';

// Komponen UI bersama: tombol, field, modal, stepper, status, lacak pesanan.

export function FieldError({ message }) {
  if (!message) return null;
  return <p className="field-error">{message}</p>;
}

export function Alert({ tone = 'error', children }) {
  if (!children) return null;
  const styles =
    tone === 'error'
      ? 'border-red-200 bg-red-50 text-red-700'
      : tone === 'success'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
        : 'border-ink-200 bg-ink-50 text-ink-600';
  return (
    <p className={`rounded-xl border p-3 text-sm ${styles}`}>{children}</p>
  );
}

export function QtyStepper({ value, min = 1, max = 99, onChange, small = false }) {
  const btn = small ? 'h-8 w-8 text-base' : 'h-10 w-10 text-lg';
  return (
    <div className="inline-flex items-center rounded-full border border-ink-200">
      <button
        type="button"
        aria-label="Kurangi jumlah"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        className={`${btn} font-medium text-ink-600 disabled:opacity-30`}
      >
        −
      </button>
      <span className={`${small ? 'w-8' : 'w-10'} text-center text-sm font-semibold`} aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        aria-label="Tambah jumlah"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        className={`${btn} font-medium text-ink-600 disabled:opacity-30`}
      >
        +
      </button>
    </div>
  );
}

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="rounded-full border border-ink-200 px-3 py-1 text-sm hover:border-ink-900"
          >
            ✕
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

// Ikon monokrom untuk tile status & lacak pesanan.
const ICON_PATHS = {
  semua: ['M4 6.5h16', 'M4 12h16', 'M4 17.5h16'],
  belum_bayar: [
    'M3.75 8.5A2.25 2.25 0 0 1 6 6.25h11',
    'M3.75 8.5v8.75A2.25 2.25 0 0 0 6 19.5h12.25a2.25 2.25 0 0 0 2.25-2.25V8.5z',
    'M15.75 13.5h2.25',
  ],
  dikemas: [
    'M3.75 8.25 12 4.5l8.25 3.75v7.5L12 19.5 3.75 15.75z',
    'M3.75 8.25 12 12l8.25-3.75',
    'M12 12v7.5',
  ],
  dikirim: [
    'M3 7.5h9.75v8.25H3z',
    'M12.75 10.5h3.5L20.25 14v1.75h-7.5z',
    'M7 18.75a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
    'M16.5 18.75a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
  ],
  selesai: ['M20.25 12a8.25 8.25 0 1 1-16.5 0 8.25 8.25 0 0 1 16.5 0Z', 'm8.5 12.25 2.5 2.5 4.5-5'],
};

export function StatusIcon({ name, className = 'h-6 w-6' }) {
  const paths = ICON_PATHS[name] || ICON_PATHS.semua;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

export function OrderStatus({ status, suffix = '' }) {
  const meta = orderStatusMeta(status);
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-600">
      <span className={`h-2 w-2 rounded-full ${meta.dot}`} aria-hidden="true" />
      {meta.label + suffix}
    </span>
  );
}

export function StatusChip({ status, suffix = '' }) {
  const meta = orderStatusMeta(status);
  return <span className={`chip ${meta.chip}`}>{meta.label + suffix}</span>;
}

/**
 * Timeline lacak pesanan: tahap yang sudah lewat ditandai penuh, tahap aktif
 * disorot dengan aksen clay, tahap berikutnya masih abu-abu.
 */
export function OrderTimeline({ order }) {
  const currentIdx = ORDER_FLOW.indexOf(order?.orderStatus);
  return (
    <ol className="mt-4">
      {ORDER_STEPS.map((step, i) => {
        const done = currentIdx >= 0 && i < currentIdx;
        const current = i === currentIdx;
        const at = order?.[step.at];
        const last = i === ORDER_STEPS.length - 1;
        return (
          <li key={step.status} className="relative flex gap-3.5 pb-5 last:pb-0">
            {!last && (
              <span
                className={`absolute left-[9px] top-5 h-full w-px ${done ? 'bg-ink-900' : 'bg-ink-200'}`}
                aria-hidden="true"
              />
            )}
            <span
              className={`relative z-10 mt-0.5 h-[19px] w-[19px] shrink-0 rounded-full border-2 bg-white ${
                current ? 'border-clay-500' : done ? 'border-ink-900' : 'border-ink-200'
              }`}
              aria-hidden="true"
            >
              {done && <span className="absolute inset-[3px] rounded-full bg-ink-900" />}
              {current && <span className="absolute inset-[3px] rounded-full bg-clay-500" />}
            </span>
            <div className="min-w-0">
              <p className={`text-sm ${current ? 'font-bold' : done ? 'font-medium text-ink-700' : 'text-ink-400'}`}>
                {step.title}
              </p>
              <p className="mt-0.5 text-xs text-ink-400">
                {at ? formatDate(at) : current ? 'Sedang berjalan' : 'Menunggu'}
              </p>
              <p className="mt-0.5 text-xs text-ink-500">{step.note}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
