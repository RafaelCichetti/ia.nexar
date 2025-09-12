

import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { clientAPI } from '../services/api';
import api from '../services/api';
import './DashboardCliente.css';
import { MensagensPorDiaChart } from '../components/DashboardCharts';
import { FaHome, FaWhatsapp, FaCalendarAlt, FaRobot, FaTimes, FaCheck, FaComments } from 'react-icons/fa';
import React, { useState } from 'react';

const abas = [
  { rota: '/cliente', label: 'Dashboard', icon: <FaHome /> },
  { rota: '/cliente/whatsapp', label: 'WhatsApp', icon: <FaWhatsapp /> },
  { rota: '/cliente/calendario', label: 'Calendário', icon: <FaCalendarAlt /> },
];


const DashboardCliente = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [whatsStatus, setWhatsStatus] = useState(null);

  React.useEffect(() => {
    setLoading(true);
    setError(null);
    const clientId = user?.client_id || user?._id;
    if (clientId) {
      Promise.all([
        clientAPI.getDashboard(clientId),
        api.get(`/whatsapp/${clientId}/status`).then(r => r.data).catch(() => null)
      ])
        .then(([dashboard, whats]) => {
          const statsData = dashboard?.data || dashboard;
          setStats(statsData);
          setWhatsStatus(whats);
          setLoading(false);
        })
        .catch((err) => {
          setError('Erro ao buscar dados do dashboard.');
          setLoading(false);
        });
    } else {
      setError('Usuário não autenticado.');
      setLoading(false);
    }
  }, [user]);

  // Debug: mostrar daily_stats no console para diagnóstico
  React.useEffect(() => {
    if (stats && stats.daily_stats) {
      console.log('DEBUG daily_stats:', stats.daily_stats);
    }
  }, [stats]);

  return (
    <div className="cliente-dashboard-welcome">
      <h1>Dashboard</h1>
      <p>Visão geral da sua conta e integrações de IA para WhatsApp</p>
      {/* Gráficos principais */}
      {stats && (
        <div style={{ width: '100%', marginBottom: 32 }}>
          <div style={{ width: '100%', background: '#232a36', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px #0002' }}>
            <MensagensPorDiaChart data={getMensagensPorDia(stats)} />
          </div>
        </div>
      )}
      {loading ? (
        <div className="loading">
          <FaRobot className="loading-icon" />
          <p>Carregando dados do dashboard...</p>
        </div>
      ) : error ? (
        <div className="error">
          <FaTimes className="error-icon" />
          <h3>Erro ao carregar dashboard</h3>
          <p>{error}</p>
        </div>
      ) : stats ? (
        <div className="cliente-dashboard-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
          {/* Cards do dashboard */}
          <div className="cliente-dashboard-card">
            <div className="cliente-dashboard-icon" style={{ background: 'linear-gradient(135deg, #ffc107 0%, #ffecb3 100%)', color: '#181c23' }}>
              💸
            </div>
            <div>
              <h2>Economia Estimada</h2>
              <p>
                {(() => {
                  // Parâmetros do cálculo
                  const salarioMensal = 1800; // Salário médio de atendente humano (R$)
                  const diasUteisMes = 22;
                  const horasPorDia = 8;
                  const mediaAtendimentosPorHora = 15; // 1 atendimento a cada 4 minutos
                  const totalMensagens = stats.statistics?.total_conversations || stats.stats?.total_messages || 0;
                  // Quantas mensagens um atendente humano faria por mês
                  const capacidadeMensal = diasUteisMes * horasPorDia * mediaAtendimentosPorHora;
                  // Proporção de economia
                  const economia = (totalMensagens / capacidadeMensal) * salarioMensal;
                  if (economia < 1) return 'R$ 0,00';
                  return economia.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 });
                })()}
                <br />
                <span style={{ fontSize: '0.95em', color: '#bfc9da' }}>Estimativa de economia usando a Nexar.</span>
              </p>
            </div>
          </div>
          <div className="cliente-dashboard-card">
            <div className="cliente-dashboard-icon" style={{ background: 'linear-gradient(135deg, #10a37f 0%, #20c997 100%)', color: '#fff' }}><FaCheck /></div>
            <div>
              <h2>Status</h2>
              <p>{stats.client_info?.active ? 'Ativo' : 'Inativo'}</p>
            </div>
          </div>
          <div className="cliente-dashboard-card">
            <div className="cliente-dashboard-icon"><FaComments /></div>
            <div>
              <h2>Mensagens Processadas</h2>
              <p>{stats.statistics?.total_conversations || 0}</p>
            </div>
          </div>
          <div className="cliente-dashboard-card">
            <div className="cliente-dashboard-icon"><FaRobot /></div>
            <div>
              <h2>Respostas da IA</h2>
              <p>{stats.statistics?.ai_responses || 0}</p>
            </div>
          </div>
          <div className="cliente-dashboard-card">
            <div className="cliente-dashboard-icon"><FaWhatsapp /></div>
            <div>
              <h2>WhatsApp Vinculado</h2>
              <p>
                {whatsStatus
                  ? (whatsStatus.status === 'ready' ? 'Conectado' : 'Não conectado')
                  : 'Verificando...'}
              </p>
            </div>
          </div>
          <div className="cliente-dashboard-card">
            <div className="cliente-dashboard-icon"><FaCalendarAlt /></div>
            <div>
              <h2>Última Mensagem</h2>
              <p>{
                stats.statistics?.last_message
                  ? new Date(stats.statistics.last_message).toLocaleString('pt-BR')
                  : 'Sem mensagens'
              }</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );


// Funções utilitárias para simular dados dos gráficos
// Funções utilitárias para gráficos usando dados reais se disponíveis
function getMensagensPorDia(stats) {
  // Se daily_stats vier preenchido, use para o gráfico
  const NUM_DIAS = 15;
  const dias = Array.from({ length: NUM_DIAS }, (_, i) => {
    const d = new Date();
    d.setHours(0,0,0,0);
    d.setDate(d.getDate() - (NUM_DIAS - 1 - i));
    return {
      dia: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate()
    };
  });
  let resultado = dias.map(({ dia, year, month, day }) => {
    let found = Array.isArray(stats.daily_stats)
      ? stats.daily_stats.find(item => {
          if (!item._id) return false;
          return (
            item._id.day === day &&
            item._id.month === month &&
            item._id.year === year
          );
        })
      : null;
    return {
      dia,
      mensagens: found ? (found.conversations || 0) : 0
    };
  });
  // Debug: mostrar array final do gráfico
  console.log('DEBUG getMensagensPorDia resultado:', resultado);
  return resultado;
}




}

export default DashboardCliente;
