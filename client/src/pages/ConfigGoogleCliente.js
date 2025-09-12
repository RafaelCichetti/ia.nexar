import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './ConfigGoogleCliente.css';

const ConfigGoogleCliente = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    client_id: '',
    client_secret: '',
    redirect_uri: ''
  });
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.client_id) return;
    setLoading(true);
    api.get(`/client/${user.client_id}`)
      .then(res => {
        if (res.data && res.data.google_oauth) {
          setForm(res.data.google_oauth);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSalvo(false);
    setErro(null);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setErro(null);
    try {
      console.log('🔎 Enviando google_oauth:', form);
      await api.put(`/client/${user.client_id}`, { google_oauth: form });
      setSalvo(true);
    } catch (err) {
      setErro('Erro ao salvar credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="config-google-cliente">
      <h2>Configurar Integração Google</h2>
      <form onSubmit={handleSubmit}>
        <label>Client ID
          <input type="text" name="client_id" value={form.client_id} onChange={handleChange} required />
        </label>
        <label>Client Secret
          <input type="text" name="client_secret" value={form.client_secret} onChange={handleChange} required />
        </label>
        <label>Redirect URI
          <input type="text" name="redirect_uri" value={form.redirect_uri} onChange={handleChange} required />
        </label>
        <button type="submit" className="btn btn-primary" disabled={loading}>Salvar</button>
        {salvo && <span className="sucesso">Salvo!</span>}
        {erro && <span className="erro">{erro}</span>}
      </form>
      <p className="dica">Dica: copie e cole as credenciais do seu app Google Cloud. O Redirect URI deve ser igual ao configurado no Google.</p>
    </div>
  );
};

export default ConfigGoogleCliente;
