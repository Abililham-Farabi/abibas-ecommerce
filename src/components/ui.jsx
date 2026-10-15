import { useEffect } from 'react';

// Komponen UI bersama: tombol, field, modal, stepper, status.

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

const DOT = {
  menunggu_pembayaran_simulasi: 'bg-amber-500',
  pembayaran_simulasi_dikonfirmasi: 'bg-sky-600',
  diproses: 'bg-violet-600',
  dikirim: 'bg-blue-600',
  selesai: 'bg-emerald-600',
  dibatalkan: 'bg-red-500',
};

const LABEL = {
  menunggu_pembayaran_simulasi: 'Menunggu pembayaran',
  pembayaran_simulasi_dikonfirmasi: 'Pembayaran dikonfirmasi',
  diproses: 'Diproses',
  dikirim: 'Dikirim',
  selesai: 'Selesai',
  dibatalkan: 'Dibatalkan',
};

export function OrderStatus({ status, suffix = '' }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-600">
      <span className={`h-2 w-2 rounded-full ${DOT[status] || 'bg-ink-300'}`} aria-hidden="true" />
      {(LABEL[status] || status) + suffix}
    </span>
  );
}
