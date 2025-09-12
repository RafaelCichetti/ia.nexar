import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FaTimes, FaKey } from 'react-icons/fa';
import '../pages/ClientList.css';

const ChangePassword = () => {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const { token } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (novaSenha !== confirmarSenha) {
      toast.error('A nova senha e a confirmação não coincidem.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/auth/change-password', {
        senha_atual: senhaAtual,
        nova_senha: novaSenha
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('Senha alterada com sucesso!');
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
      setShowModal(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!showModal) {
    // Redireciona ou esconde modal após sucesso
    window.history.back();
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h2><FaKey style={{marginRight: 8}}/>Alterar Senha</h2>
          <button className="modal-close" onClick={() => setShowModal(false)}>
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Senha Atual *</label>
            <input
              type="password"
              value={senhaAtual}
              onChange={e => setSenhaAtual(e.target.value)}
              required
              className="form-control"
              autoComplete="current-password"
            />
          </div>
          <div className="form-group">
            <label>Nova Senha *</label>
            <input
              type="password"
              value={novaSenha}
              onChange={e => setNovaSenha(e.target.value)}
              required
              className="form-control"
              autoComplete="new-password"
            />
          </div>
          <div className="form-group">
            <label>Confirmar Nova Senha *</label>
            <input
              type="password"
              value={confirmarSenha}
              onChange={e => setConfirmarSenha(e.target.value)}
              required
              className="form-control"
              autoComplete="new-password"
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{marginLeft: 8}}>
              {loading ? 'Salvando...' : 'Alterar Senha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
