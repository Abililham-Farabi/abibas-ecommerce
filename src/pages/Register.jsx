import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, FieldError } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { validateRegister } from '../utils/validate';

export default function Register() {
  const { register } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setServerError('');
    const v = validateRegister(form);
    setErrors(v);
    if (Object.keys(v).length > 0) return;
    setBusy(true);
    try {
      await register(form);
      navigate(params.get('next') || '/', { replace: true });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container-store flex justify-center py-14">
      <div className="w-full max-w-md">
        <h1 className="font-display text-center text-3xl font-bold">Buat akun</h1>
        <p className="mt-2 text-center text-sm text-ink-500">Satu akun untuk checkout lebih cepat dan lacak pesanan.</p>
        <form onSubmit={onSubmit} className="card mt-8 space-y-4 p-6 sm:p-8" noValidate>
          <div>
            <label className="label" htmlFor="rg-name">Nama lengkap</label>
            <input id="rg-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" autoComplete="name" />
            <FieldError message={errors.name} />
          </div>
          <div>
            <label className="label" htmlFor="rg-email">Email</label>
            <input id="rg-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" autoComplete="email" />
            <FieldError message={errors.email} />
          </div>
          <div>
            <label className="label" htmlFor="rg-pass">Kata sandi (min. 8 karakter)</label>
            <input id="rg-pass" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" autoComplete="new-password" />
            <FieldError message={errors.password} />
          </div>
          <Alert>{serverError}</Alert>
          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? 'Mendaftar…' : 'Daftar'}
          </button>
          <p className="text-center text-sm text-ink-500">
            Sudah punya akun? <Link to={`/login${params.get('next') ? `?next=${encodeURIComponent(params.get('next'))}` : ''}`} className="link-underline">Masuk</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
