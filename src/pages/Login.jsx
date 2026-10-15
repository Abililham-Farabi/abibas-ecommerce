import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, FieldError } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { validateLogin } from '../utils/validate';

export default function Login() {
  const { login } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setServerError('');
    const v = validateLogin(form);
    setErrors(v);
    if (Object.keys(v).length > 0) return;
    setBusy(true);
    try {
      await login(form);
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
        <h1 className="font-display text-center text-3xl font-bold">Selamat datang kembali</h1>
        <p className="mt-2 text-center text-sm text-ink-500">Masuk untuk checkout dan melihat pesananmu.</p>
        <form onSubmit={onSubmit} className="card mt-8 space-y-4 p-6 sm:p-8" noValidate>
          <div>
            <label className="label" htmlFor="li-email">Email</label>
            <input id="li-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" autoComplete="email" />
            <FieldError message={errors.email} />
          </div>
          <div>
            <label className="label" htmlFor="li-pass">Kata sandi</label>
            <input id="li-pass" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" autoComplete="current-password" />
            <FieldError message={errors.password} />
          </div>
          <Alert>{serverError}</Alert>
          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? 'Masuk…' : 'Masuk'}
          </button>
          <p className="text-center text-sm text-ink-500">
            Belum punya akun? <Link to={`/register${params.get('next') ? `?next=${encodeURIComponent(params.get('next'))}` : ''}`} className="link-underline">Daftar</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
