import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('skillswap_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('skillswap_token'));

  const persistSession = (user, token) => {
    localStorage.setItem('skillswap_token', token);
    localStorage.setItem('skillswap_user', JSON.stringify(user));
    setUser(user);
    setToken(token);
  };

  const register = useCallback(async ({ name, email, password }) => {
    const res = await api.post('/auth/register', { name, email, password });
    const { user, token } = res.data.data;
    persistSession(user, token);
    return user;
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const res = await api.post('/auth/login', { email, password });
    const { user, token } = res.data.data;
    persistSession(user, token);
    return user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('skillswap_token');
    localStorage.removeItem('skillswap_user');
    setUser(null);
    setToken(null);
  }, []);

  const refreshMe = useCallback(async () => {
    const res = await api.get('/auth/me');
    const updated = res.data.data.user;
    localStorage.setItem('skillswap_user', JSON.stringify(updated));
    setUser(updated);
    return updated;
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, register, login, logout, refreshMe, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
