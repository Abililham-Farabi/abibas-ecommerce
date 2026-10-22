import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  // Selama validasi sesi, pengguna yang punya petunjuk sesi langsung melihat
  // kerangka halaman (bukan teks "Memuat…" yang menahan seluruh halaman).
  if (!user && loading) {
    return (
      <div className="container-store max-w-4xl py-8" aria-busy="true">
        <div className="h-8 w-48 animate-pulse rounded bg-ink-100" />
        <div className="card mt-5 h-28 animate-pulse bg-ink-100" />
        <div className="card mt-4 h-40 animate-pulse bg-ink-100" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }
  return children;
}
