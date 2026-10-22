import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { isDemoMode } from '../utils/format';

const AuthContext = createContext(null);
const DEMO_KEY = 'abibas_demo_user_v1';
// Petunjuk sesi untuk UI (bukan autentikasi): memungkinkan halaman dilukis
// lebih dulu saat reload, lalu divalidasi ke server lewat /api/me.
const HINT_KEY = 'abibas_auth_hint_v1';
const ORDERS_CACHE_PREFIX = 'abibas_orders_cache_v1:';

function readHint() {
  try {
    const raw = localStorage.getItem(HINT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveHint(user) {
  try {
    localStorage.setItem(HINT_KEY, JSON.stringify(user));
  } catch {
    /* abaikan */
  }
}

function clearHint() {
  try {
    localStorage.removeItem(HINT_KEY);
  } catch {
    /* abaikan */
  }
}

function clearOrderCaches() {
  try {
    Object.keys(sessionStorage)
      .filter((key) => key.startsWith(ORDERS_CACHE_PREFIX))
      .forEach((key) => sessionStorage.removeItem(key));
  } catch {
    /* abaikan */
  }
}

export function AuthProvider({ children }) {
  const demo = isDemoMode();
  const [user, setUser] = useState(() => (demo ? null : readHint()));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      if (demo) {
        try {
          const raw = localStorage.getItem(DEMO_KEY);
          if (raw && !cancelled) setUser(JSON.parse(raw));
        } catch {
          /* abaikan */
        }
        setLoading(false);
        return;
      }
      try {
        const data = await api.me();
        if (!cancelled) {
          setUser(data.user);
          saveHint(data.user);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          clearHint();
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, [demo]);

  const value = useMemo(
    () => ({
      user,
      loading,
      demo,
      async register({ name, email, password }) {
        if (demo) {
          const users = JSON.parse(localStorage.getItem('abibas_demo_users_v1') || '[]');
          const norm = email.trim().toLowerCase();
          if (users.some((u) => u.email === norm))
            throw new Error('Email sudah terdaftar. Silakan masuk.');
          const u = { userId: `demo-${Date.now()}`, name: name.trim(), email: norm };
          users.push({ ...u, password });
          localStorage.setItem('abibas_demo_users_v1', JSON.stringify(users));
          localStorage.setItem(DEMO_KEY, JSON.stringify(u));
          setUser(u);
          return u;
        }
        const data = await api.register({ name, email, password });
        setUser(data.user);
        saveHint(data.user);
        return data.user;
      },
      async login({ email, password }) {
        if (demo) {
          const users = JSON.parse(localStorage.getItem('abibas_demo_users_v1') || '[]');
          const norm = email.trim().toLowerCase();
          const found = users.find((u) => u.email === norm && u.password === password);
          if (!found) throw new Error('Email atau kata sandi salah.');
          const u = { userId: found.userId, name: found.name, email: found.email };
          localStorage.setItem(DEMO_KEY, JSON.stringify(u));
          setUser(u);
          return u;
        }
        const data = await api.login({ email, password });
        setUser(data.user);
        saveHint(data.user);
        return data.user;
      },
      async logout() {
        if (demo) {
          localStorage.removeItem(DEMO_KEY);
          clearOrderCaches();
          setUser(null);
          return;
        }
        try {
          await api.logout();
        } finally {
          clearHint();
          clearOrderCaches();
          setUser(null);
        }
      },
    }),
    [user, loading, demo],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus di dalam AuthProvider');
  return ctx;
}
