import React, { useState, useEffect } from 'react';
import { 
  FaUsers, 
  FaRobot, 
  FaComments, 
  FaChartLine,
  FaWhatsapp,
  FaCheck,
  FaTimes
} from 'react-icons/fa';
import { clientAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    totalMessages: 0,
    aiResponses: 0
  });
  const [recentClients, setRecentClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Carregar lista de clientes
      const clientsResponse = await clientAPI.listClients();
      const clients = clientsResponse.data || [];

      // Calcular estatísticas
      const totalClients = clients.length;
      const activeClients = clients.filter(client => client.active).length;
      
      let totalMessages = 0;
      let aiResponses = 0;

      clients.forEach(client => {
        totalMessages += client.stats?.total_messages || 0;
        aiResponses += client.stats?.ai_responses || 0;
      });

      setStats({
        totalClients,
        activeClients,
        totalMessages,
        aiResponses
      });

      // Clientes recentes (últimos 5)
      const sortedClients = clients
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      
      setRecentClients(sortedClients);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">
          <FaRobot className="loading-icon" />
          <p>Carregando dados do dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error">
          <FaTimes className="error-icon" />
          <h3>Erro ao carregar dashboard</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadDashboardData}>
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Visão geral da sua plataforma de IA para WhatsApp</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FaUsers />
          </div>
          <div className="stat-info">
            <div className="stat-number">{stats.totalClients}</div>
            <div className="stat-label">Total de Clientes</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon active">
            <FaCheck />
          </div>
          <div className="stat-info">
            <div className="stat-number">{stats.activeClients}</div>
            <div className="stat-label">Clientes Ativos</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon messages">
            <FaComments />
          </div>
          <div className="stat-info">
            <div className="stat-number">{stats.totalMessages}</div>
            <div className="stat-label">Mensagens Processadas</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon ai">
            <FaRobot />
          </div>
          <div className="stat-info">
            <div className="stat-number">{stats.aiResponses}</div>
            <div className="stat-label">Respostas da IA</div>
          </div>
        </div>
      </div>

      {/* Clientes Recentes */}
      <div className="dashboard-section">
        <div className="card">
          <div className="card-header">
            <h2>Clientes Recentes</h2>
            <a href="/clients" className="btn btn-primary">Ver Todos</a>
          </div>
          <div className="card-body">
            {recentClients.length === 0 ? (
              <div className="empty-state">
                <FaUsers className="empty-icon" />
                <p>Nenhum cliente cadastrado ainda</p>
                <a href="/clients" className="btn btn-primary">Cadastrar Primeiro Cliente</a>
              </div>
            ) : (
              <div className="recent-clients">
                {recentClients.map((client) => (
                  <div key={client._id} className="client-item">
                    <div className="client-info">
                      <div className="client-name">{client.name}</div>
                      <div className="client-details">
                        <span className="client-id">ID: {client.client_id}</span>
                        <span className={`client-status ${client.active ? 'active' : 'inactive'}`}>
                          {client.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </div>
                    <div className="client-stats">
                      <div className="client-stat">
                        <FaComments />
                        <span>{client.stats?.total_messages || 0}</span>
                      </div>
                      <div className="client-stat">
                        <FaRobot />
                        <span>{client.ia_config?.length || 0}</span>
                      </div>
                    </div>
                    <div className="client-actions">
                      <a href={`/client/${client.client_id}`} className="btn btn-sm btn-primary">
                        Ver Detalhes
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status do Sistema */}
      <div className="dashboard-section">
        <div className="card">
          <div className="card-header">
            <h2>Status do Sistema</h2>
          </div>
          <div className="card-body">
            <div className="system-status">
              <div className="status-item">
                <div className="status-indicator online"></div>
                <div className="status-info">
                  <div className="status-name">API do Servidor</div>
                  <div className="status-description">Funcionando normalmente</div>
                </div>
              </div>
              <div className="status-item">
                <div className="status-indicator online"></div>
                <div className="status-info">
                  <div className="status-name">Webhook do WhatsApp</div>
                  <div className="status-description">Recebendo mensagens</div>
                </div>
              </div>
              <div className="status-item">
                <div className="status-indicator online"></div>
                <div className="status-info">
                  <div className="status-name">Banco de Dados</div>
                  <div className="status-description">Conectado</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
