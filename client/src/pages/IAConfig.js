import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaArrowLeft, 
  FaRobot, 
  FaEdit,
  FaSave,
  FaTimes
} from 'react-icons/fa';
import { clientAPI } from '../services/api';
import './IAConfig.css';

const IAConfig = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingAssistant, setEditingAssistant] = useState(false);
  const [editingInstructions, setEditingInstructions] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [assistantName, setAssistantName] = useState('');
  const [aiInstructions, setAiInstructions] = useState('');

  useEffect(() => {
    loadClient();
  }, [id]);

  const loadClient = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Carregando cliente:', id);
      const response = await clientAPI.getClient(id);
      console.log('📦 Resposta da API:', response);
      setClient(response.data);
      
      // Carregar campos de configuração da IA
      console.log('🤖 Nome do assistente:', response.data.ai_assistant_name);
      console.log('📝 Instruções:', response.data.ai_instructions);
      setAssistantName(response.data.ai_assistant_name || '');
      setAiInstructions(response.data.ai_instructions || '');
    } catch (err) {
      console.error('❌ Erro ao carregar cliente:', err);
      setError(err.message);
      toast.error('Erro ao carregar dados do cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAssistantName = async () => {
    try {
      console.log('💾 Salvando nome do assistente:', assistantName);
      await clientAPI.updateClient(id, { ai_assistant_name: assistantName });
      toast.success('Nome do assistente atualizado com sucesso!');
      setEditingAssistant(false);
      console.log('🔄 Recarregando dados do cliente...');
      
      // Forçar refresh completo
      setRefreshKey(prev => prev + 1);
      await loadClient();
    } catch (err) {
      console.error('❌ Erro ao salvar nome:', err);
      toast.error(err.message);
    }
  };

  const handleUpdateAiInstructions = async () => {
    try {
      console.log('💾 Salvando instruções da IA:', aiInstructions);
      await clientAPI.updateClient(id, { ai_instructions: aiInstructions });
      toast.success('Instruções da IA atualizadas com sucesso!');
      setEditingInstructions(false);
      console.log('🔄 Recarregando dados do cliente...');
      
      // Forçar refresh completo
      setRefreshKey(prev => prev + 1);
      await loadClient();
    } catch (err) {
      console.error('❌ Erro ao salvar instruções:', err);
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="ia-config">
        <div className="loading">
          <FaRobot className="loading-icon" />
          <p>Carregando configurações...</p>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="ia-config">
        <div className="error">
          <FaTimes className="error-icon" />
          <h3>Erro ao carregar configurações</h3>
          <p>{error || 'Cliente não encontrado'}</p>
          <Link to="/clients" className="btn btn-primary">
            <FaArrowLeft /> Voltar para Lista
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="ia-config">
      <div className="page-header">
        <div className="header-nav">
          <Link to={`/client/${id}`} className="btn btn-secondary">
            <FaArrowLeft /> Voltar
          </Link>
        </div>
        <div className="header-content">
          <h1>Configurar IA - {client.name}</h1>
          <p>Configure o assistente virtual inteligente com ChatGPT</p>
        </div>
        <div className="header-actions">
          <Link 
            to={`/client/${id}/test`}
            className="btn btn-success"
          >
            <FaRobot /> Testar IA
          </Link>
        </div>
      </div>

      {/* Nome do Assistente IA */}
      <div className="config-section">
        <h3>Nome do Assistente IA</h3>
        <p className="section-description">
          Defina um nome para seu assistente virtual (ex: "Sofia", "Alex", "Assistente TechStore")
        </p>
        
        {editingAssistant ? (
          <div className="assistant-editor">
            <div className="form-group">
              <input
                type="text"
                value={assistantName}
                onChange={(e) => setAssistantName(e.target.value)}
                placeholder="Ex: Sofia, Alex, Assistente Virtual..."
                className="form-control"
                maxLength={50}
              />
              <small className="form-text">Máximo 50 caracteres</small>
            </div>
            <div className="editor-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setEditingAssistant(false);
                  setAssistantName(client.ai_assistant_name || '');
                }}
              >
                <FaTimes /> Cancelar
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleUpdateAssistantName}
              >
                <FaSave /> Salvar Nome
              </button>
            </div>
          </div>
        ) : (
          <div className="assistant-display">
            <div className="current-value">
              <strong>Nome atual:</strong> {assistantName || 'Não definido'}
            </div>
            <button 
              className="btn btn-secondary"
              onClick={() => setEditingAssistant(true)}
            >
              <FaEdit /> Editar Nome
            </button>
          </div>
        )}
      </div>

      {/* Instruções da IA */}
      <div className="config-section">
        <h3>Instruções da IA (Prompt do Sistema)</h3>
        <p className="section-description">
          Defina como a IA deve se comportar, sua personalidade e conhecimentos específicos sobre sua empresa.
        </p>
        
        {editingInstructions ? (
          <div className="instructions-editor">
            <div className="form-group">
              <textarea
                value={aiInstructions}
                onChange={(e) => setAiInstructions(e.target.value)}
                placeholder="Ex: Você é o assistente virtual da Empresa XYZ. Seja sempre cordial e prestativo. Nossa empresa oferece..."
                className="form-control instructions-textarea"
                rows={8}
                maxLength={2000}
              />
              <small className="form-text">
                Máximo 2000 caracteres. Seja específico sobre: personalidade, produtos/serviços, horários, contatos.
              </small>
            </div>
            <div className="editor-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setEditingInstructions(false);
                  setAiInstructions(client.ai_instructions || '');
                }}
              >
                <FaTimes /> Cancelar
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleUpdateAiInstructions}
              >
                <FaSave /> Salvar Instruções
              </button>
            </div>
          </div>
        ) : (
          <div className="instructions-display">
            <div className="current-value">
              <strong>Instruções atuais:</strong>
              <div className="instructions-preview">
                {aiInstructions ? (
                  <pre>{aiInstructions}</pre>
                ) : (
                  <em>Nenhuma instrução definida</em>
                )}
              </div>
            </div>
            <button 
              className="btn btn-secondary"
              onClick={() => setEditingInstructions(true)}
            >
              <FaEdit /> Editar Instruções
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IAConfig;
