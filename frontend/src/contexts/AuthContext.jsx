import { createContext, useContext, useEffect, useState } from 'react';
import { api, setToken, getStoredToken, clearToken } from '@/lib/api';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function signIn(email, password) {
    try {
      const data = await api.post('/auth/login', { email, password });
      setToken(data.token);
      setUser(data.user);
      return { error: null };
    } catch (err) {
      return { error: err.message };
    }
  }

  async function signUp(name, email, password) {
    try {
      const data = await api.post('/auth/register', { name, email, password });
      setToken(data.token);
      setUser(data.user);
      return { error: null };
    } catch (err) {
      return { error: err.message };
    }
  }

  async function signOut() {
    clearToken();
    setUser(null);
  }

  async function refreshProfile() {
    try {
      const data = await api.get('/auth/me');
      setUser(data.user);
    } catch {
      // ignore
    }
  }

  async function updateProfile(updates) {
    try {
      const data = await api.patch('/auth/me', updates);
      setUser(data.user);
      return { error: null };
    } catch (err) {
      return { error: err.message };
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, signOut, refreshProfile, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
