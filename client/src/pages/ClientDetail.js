import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaArrowLeft, 
  FaEdit, 
  FaRobot, 
  FaComments,
  FaWhatsapp,
  FaCheck,
  FaTimes,
  FaChartLine,
  FaUsers,
  FaCoins,
  FaClock,
  FaDownload,
  FaEye,
  FaBrain
} from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import jsPDF from 'jspdf';
import { clientAPI } from '../services/api';
import api from '../services/api';
import WhatsAppConnect from '../components/WhatsAppConnect';

import './ClientDetail_new.css';

const ClientDetail = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadClientData();
  }, [id]);

  const loadClientData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Carregar dados do cliente e estatísticas em paralelo
      const [clientResponse, statsResponse] = await Promise.all([
        clientAPI.getClient(id),
        api.get(`/client/${id}/stats`).then(res => res.data)
      ]);
      setClient(clientResponse.data);
      setStats(statsResponse.data);
    } catch (err) {
      setError(err.message);
      toast.error('Erro ao carregar dados do cliente');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (period = '30_days') => {
    try {
      toast.info('Gerando relatório PDF...');
      
      if (!stats || !client) {
        toast.error('Dados insuficientes para gerar o relatório');
        return;
      }

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      let yPosition = 30;
      
      // Header do PDF
      doc.setFontSize(20);
      doc.setTextColor(16, 163, 127);
      doc.text('Relatório de Estatísticas', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 30;
      
      // Informações do cliente
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(`Cliente: ${client.name}`, 20, yPosition);
      yPosition += 10;
      doc.text(`ID: ${client.client_id}`, 20, yPosition);
      yPosition += 10;
      doc.text(`Assistente: ${client.ai_assistant_name || 'Padrão'}`, 20, yPosition);
      yPosition += 10;
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, yPosition);
      yPosition += 20;
      
      // Linha separadora
      doc.setDrawColor(16, 163, 127);
      doc.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 20;
      
      // Estatísticas principais
      doc.setFontSize(16);
      doc.setTextColor(16, 163, 127);
      doc.text('📊 ESTATÍSTICAS PRINCIPAIS', 20, yPosition);
      yPosition += 15;
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      const stats_data = [
        `Total de Conversas: ${formatNumber(stats.statistics?.total_conversations || 0)}`,
        `Usuários Únicos: ${formatNumber(stats.statistics?.unique_users || 0)}`,
        `Tokens Processados: ${formatNumber(stats.statistics?.total_tokens || 0)}`,
        `Custo Total: ${formatCurrency(stats.statistics?.total_cost_usd || 0)}`,
        `Custo Médio por Conversa: ${formatCurrency(stats.statistics?.avg_cost_per_conversation || 0)}`,
        `Modelo Atual: ${stats.current_model || 'gpt-3.5-turbo'}`,
        `Status OpenAI: ${stats.openai_status ? 'Operacional' : 'Erro'}`
      ];
      
      stats_data.forEach(line => {
        doc.text(line, 25, yPosition);
        yPosition += 8;
      });
      
      yPosition += 10;
      
      // Uso por modelo
      if (stats.model_usage && stats.model_usage.length > 0) {
        doc.setFontSize(16);
        doc.setTextColor(16, 163, 127);
        doc.text('🤖 USO POR MODELO DE IA', 20, yPosition);
        yPosition += 15;
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        
        stats.model_usage.forEach(model => {
          doc.text(`Modelo: ${model._id}`, 25, yPosition);
          yPosition += 6;
          doc.text(`  • Conversas: ${formatNumber(model.count)}`, 30, yPosition);
          yPosition += 6;
          doc.text(`  • Tokens: ${formatNumber(model.tokens)}`, 30, yPosition);
          yPosition += 6;
          doc.text(`  • Custo: ${formatCurrency(model.cost)}`, 30, yPosition);
          yPosition += 6;
          doc.text(`  • Tempo Médio: ${model.avg_response_time?.toFixed(1) || '0'}ms`, 30, yPosition);
          yPosition += 12;
        });
      }
      
      // Informações do sistema
      doc.setFontSize(16);
      doc.setTextColor(16, 163, 127);
      doc.text('⚙️ INFORMAÇÕES DO SISTEMA', 20, yPosition);
      yPosition += 15;
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      const system_data = [
        `Status do Cliente: ${client.active ? 'Ativo' : 'Inativo'}`,
        `Personalização: ${stats.client_info?.has_custom_instructions ? 'Configurada' : 'Não configurada'}`,
        `Criado em: ${new Date(client.created_at).toLocaleDateString('pt-BR')}`,
        `Última atualização: ${new Date(client.updated_at).toLocaleDateString('pt-BR')}`
      ];
      
      system_data.forEach(line => {
        doc.text(line, 25, yPosition);
        yPosition += 8;
      });
      
      // Footer
      yPosition += 20;
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text('Gerado automaticamente pelo Sistema SaaS IA WhatsApp', pageWidth / 2, yPosition, { align: 'center' });
      doc.text(`${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, yPosition + 10, { align: 'center' });
      
      // Salvar PDF
      const fileName = `relatorio_${client.client_id}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      toast.success('Relatório PDF gerado com sucesso!');
      
    } catch (err) {
      console.error('Erro ao gerar relatório:', err);
      toast.error('Erro ao gerar relatório PDF: ' + err.message);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4
    }).format(value);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading) {
    return (
      <div className="client-detail">
        <div className="loading">
          <FaRobot className="loading-icon" />
          <p>Carregando dados do cliente...</p>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="client-detail">
        <div className="error">
          <FaTimes className="error-icon" />
          <h3>Cliente não encontrado</h3>
          <p>{error || 'O cliente solicitado não existe'}</p>
          <Link to="/clients" className="btn btn-primary">
            <FaArrowLeft /> Voltar para Lista
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="client-detail">
      <div className="page-header">
        <div className="header-top">
          <Link to="/clients" className="btn btn-secondary">
            <FaArrowLeft /> Voltar
          </Link>
          <div className="client-info">
            <h1>{client.name}</h1>
            <span className="client-id">ID: {client.client_id}</span>
          </div>
        </div>
        <div className="header-bottom">
          {client.ai_assistant_name && (
            <div className="assistant-info">
              <span className="assistant-badge">
                <FaBrain /> Assistente: {client.ai_assistant_name}
              </span>
            </div>
          )}
          <div className="header-actions">
            <button 
              onClick={() => generateReport('30_days')}
              className="btn btn-info"
              disabled={!stats}
            >
              <FaDownload /> Relatório PDF
            </button>
            <Link 
              to={`/client/${client.client_id}/ia`}
              className="btn btn-primary"
            >
              <FaRobot /> Configurar IA
            </Link>
            <Link 
              to={`/client/${client.client_id}/test`}
              className="btn btn-success"
            >
              <FaComments /> Testar Chat
            </Link>
          </div>
        </div>
      </div>

      <div className="client-overview">
        <div className="status-card">
          <div className="status-header">
            <h3><FaEye /> Status do Sistema</h3>
            <div className={`status-badge ${client.active ? 'active' : 'inactive'}`}>
              {client.active ? <FaCheck /> : <FaTimes />}
              {client.active ? 'Sistema Ativo' : 'Sistema Inativo'}
            </div>
          </div>
          <div className="status-info">
            <div className="info-item">
              <span className="label">Modelo OpenAI</span>
              <span className="value">{stats?.current_model || 'gpt-3.5-turbo'}</span>
            </div>
            <div className="info-item">
              <span className="label">API OpenAI</span>
              <span className={`status-dot ${stats?.openai_status ? 'active' : 'inactive'}`}>
                {stats?.openai_status ? 'Operacional' : 'Erro de conexão'}
              </span>
            </div>
            <div className="info-item">
              <span className="label">Personalização</span>
              <span className={`status-dot ${stats?.client_info?.has_custom_instructions ? 'active' : 'inactive'}`}>
                {stats?.client_info?.has_custom_instructions ? 'Configurada' : 'Não configurada'}
              </span>
            </div>
            <div className="info-item">
              <span className="label">Criado em</span>
              <span className="value">{new Date(client.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="info-item">
              <span className="label">Atualizado em</span>
              <span className="value">{new Date(client.updated_at).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </div>


        {/* Seção WhatsApp */}
        <div className="whatsapp-section">
          <h3><FaWhatsapp /> Conexão WhatsApp</h3>
          <WhatsAppConnect clientId={client.client_id} />
        </div>

        {/* Seção Google Agenda */}
        <div className="google-calendar-section">

        </div>

        <div className="stats-section">
          <h3>📊 Estatísticas de Uso (Últimos 30 dias)</h3>
          <div className="stats-grid">
            <div className="stat-card conversations">
              <div className="stat-icon">
                <FaComments />
              </div>
              <div className="stat-info">
                <div className="stat-number">{formatNumber(stats?.statistics?.monthly_conversations || 0)}</div>
                <div className="stat-label">Conversas este mês</div>
                <div className="stat-sublabel">Total: {formatNumber(stats?.statistics?.total_conversations || 0)}</div>
              </div>
            </div>

            <div className="stat-card users">
              <div className="stat-icon">
                <FaUsers />
              </div>
              <div className="stat-info">
                <div className="stat-number">{formatNumber(stats?.statistics?.unique_users || 0)}</div>
                <div className="stat-label">Usuários únicos</div>
                <div className="stat-sublabel">Telefones diferentes</div>
              </div>
            </div>

            <div className="stat-card tokens">
              <div className="stat-icon">
                <FaBrain />
              </div>
              <div className="stat-info">
                <div className="stat-number">{formatNumber(stats?.statistics?.total_tokens || 0)}</div>
                <div className="stat-label">Tokens processados</div>
                <div className="stat-sublabel">OpenAI API</div>
              </div>
            </div>

            <div className="stat-card cost">
              <div className="stat-icon">
                <FaCoins />
              </div>
              <div className="stat-info">
                <div className="stat-number">{formatCurrency(stats?.statistics?.total_cost_usd || 0)}</div>
                <div className="stat-label">Custo total</div>
                <div className="stat-sublabel">Média: {formatCurrency(stats?.statistics?.avg_cost_per_conversation || 0)}/conversa</div>
              </div>
            </div>
          </div>
        </div>

        {stats?.daily_stats && stats.daily_stats.length > 0 && (
          <div className="chart-section">
            <h3>📈 Atividade Diária</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.daily_stats.map(item => ({
                  day: `${item._id.day}/${item._id.month}`,
                  conversas: item.conversations,
                  tokens: item.tokens,
                  custo: item.cost
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'custo') return [formatCurrency(value), 'Custo'];
                      return [formatNumber(value), name];
                    }}
                  />
                  <Line type="monotone" dataKey="conversas" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="tokens" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {stats?.model_usage && stats.model_usage.length > 0 && (
          <div className="model-section">
            <h3>🤖 Uso por Modelo de IA</h3>
            <div className="model-stats">
              {stats.model_usage.map((model, index) => (
                <div key={model._id} className="model-card">
                  <div className="model-header">
                    <h4>{model._id}</h4>
                    <span className="model-count">{formatNumber(model.count)} conversas</span>
                  </div>
                  <div className="model-details">
                    <div className="detail-item">
                      <span className="label">Tokens:</span>
                      <span className="value">{formatNumber(model.tokens)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Custo:</span>
                      <span className="value">{formatCurrency(model.cost)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Tempo médio:</span>
                      <span className="value">{Math.round(model.avg_response_time)}ms</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="tech-section">
          <h3>⚙️ Informações Técnicas</h3>
          <div className="tech-info">
            <div className="info-group">
              <label>Nome da Empresa:</label>
              <span>{client.name}</span>
            </div>
            <div className="info-group">
              <label>Número do WhatsApp:</label>
              <span>{client.phone_number}</span>
            </div>
            <div className="info-group">
              <label>CNPJ/CPF:</label>
              <span>{client.cnpj_cpf}</span>
            </div>
            <div className="info-group">
              <label>Endereço:</label>
              <span>{client.endereco}</span>
            </div>
            <div className="info-group">
              <label>Número:</label>
              <span>{client.numero}</span>
            </div>
            <div className="info-group">
              <label>Complemento:</label>
              <span>{client.complemento}</span>
            </div>
            <div className="info-group">
              <label>Bairro:</label>
              <span>{client.bairro}</span>
            </div>
            <div className="info-group">
              <label>Cidade:</label>
              <span>{client.cidade}</span>
            </div>
            <div className="info-group">
              <label>Estado:</label>
              <span>{client.estado}</span>
            </div>
            <div className="info-group">
              <label>CEP:</label>
              <span>{client.cep}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetail;
