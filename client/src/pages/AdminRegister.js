import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import './AdminRegister.css';

const AdminRegister = () => {
  const API_BASE = process.env.REACT_APP_API_BASE || process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5010' : '');
  const { token, user } = useAuth();
  const [form, setForm] = useState({ nome: '', email: '', senha: '', confirmar: '' });
  const [loading, setLoading] = useState(false);

  if (!user || user.tipo !== 'admin') return null;

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome || !form.email || !form.senha) return toast.error('Preencha todos os campos');
    if (form.senha !== form.confirmar) return toast.error('Senhas não conferem');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ nome: form.nome, email: form.email, senha: form.senha, tipo: 'admin' })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Administrador criado com sucesso');
        setForm({ nome: '', email: '', senha: '', confirmar: '' });
      } else {
        toast.error(data.error || 'Erro ao criar administrador');
      }
    } catch (err) {
      toast.error('Erro de rede');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-register-container">
      <h2>Novo Administrador</h2>
      <form onSubmit={onSubmit} className="admin-register-form" autoComplete="off">
        <div className="row">
          <label>Nome</label>
          <input name="nome" value={form.nome} onChange={onChange} placeholder="Nome completo" required />
        </div>
        <div className="row">
          <label>E-mail</label>
          <input type="email" name="email" value={form.email} onChange={onChange} placeholder="email@dominio.com" required />
        </div>
        <div className="row">
          <label>Senha</label>
          <input type="password" name="senha" value={form.senha} onChange={onChange} placeholder="Senha" required />
        </div>
        <div className="row">
          <label>Confirmar Senha</label>
          <input type="password" name="confirmar" value={form.confirmar} onChange={onChange} placeholder="Repita a senha" required />
        </div>
        <button type="submit" className="btn" disabled={loading}>{loading ? 'Salvando...' : 'Criar Administrador'}</button>
      </form>
    </div>
  );
};

export default AdminRegister;
