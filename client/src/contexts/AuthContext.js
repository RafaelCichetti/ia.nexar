import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) setUser(data.data);
          else logout();
        })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, senha) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.data.token);
        localStorage.setItem('token', data.data.token);
        setUser(data.data.user);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        toast.success('Login realizado com sucesso!');
        return true;
      } else {
        toast.error(data.error || 'Erro ao fazer login');
        return false;
      }
    } catch {
      toast.error('Erro ao conectar ao servidor');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
  setUser(null);
  setToken('');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
