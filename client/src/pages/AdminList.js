import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaUsers, FaSearch, FaUserShield, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './AdminList.css';

const AdminList = () => {
  const API_BASE = process.env.REACT_APP_API_BASE || process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5010' : '');
  const { token, user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  useEffect(() => { if (user?.tipo === 'admin') carregar(); }, [user]);

  const carregar = async () => {
    setLoading(true);
    try {
  const res = await fetch(`${API_BASE}/api/auth/admins`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setAdmins(data.data);
        setFiltered(data.data);
      } else {
        toast.error(data.error || 'Erro ao listar administradores');
      }
    } catch (e) {
      toast.error('Falha de rede');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const b = busca.toLowerCase();
    setFiltered(admins.filter(a => a.nome.toLowerCase().includes(b) || a.email.toLowerCase().includes(b)));
  }, [busca, admins]);

  if (!user || user.tipo !== 'admin') return null;

  return (
    <div className="admin-list-page">
      <div className="page-header">
        <div className="header-content">
          <h1><FaUserShield /> Administradores</h1>
          <p>Gerencie os acessos de administradores da plataforma</p>
        </div>
        <div className="search-box admins">
          <FaSearch className="search-icon" />
          <input placeholder="Buscar por nome ou e-mail" value={busca} onChange={e => setBusca(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <FaUsers className="loading-icon" />
          <p>Carregando administradores...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <FaUsers className="empty-icon" />
          <h3>Nenhum administrador encontrado</h3>
          <p>Ainda não há administradores correspondentes à busca.</p>
        </div>
      ) : (
        <div className="admins-grid">
          {filtered.map(ad => (
            <div key={ad._id || ad.email} className="admin-card">
              <div className="admin-head">
                <div className="admin-avatar">{ad.nome.charAt(0).toUpperCase()}</div>
                <div className="admin-info">
                  <h3>{ad.nome}</h3>
                  <span className="admin-email">{ad.email}</span>
                </div>
              </div>
              <div className="admin-meta">
                <div className="meta-item">
                  <FaCalendarAlt /> <span>Criado em: {new Date(ad.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminList;
