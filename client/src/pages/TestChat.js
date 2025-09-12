import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaArrowLeft, 
  FaPaperPlane, 
  FaRobot, 
  FaUser,
  FaCheckCircle,
  FaTimesCircle,
  FaCog,
  FaLightbulb,
  FaTimes
} from 'react-icons/fa';
import { clientAPI } from '../services/api';
import './TestChat.css';

const TestChat = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadClient();
  }, [id]);

  useEffect(() => {
    // Atualizar mensagem inicial quando cliente for carregado
    if (client && client.data && client.data.name) {
      setMessages([
        {
          id: 1,
          type: 'system',
          text: `Bem-vindo ao chat de teste da ${client.data.name}! Digite uma mensagem para testar as respostas da IA.`,
          timestamp: new Date()
        }
      ]);
    }
  }, [client]);

  const loadClient = async () => {
    try {
      setLoading(true);
      console.log('Tentando carregar cliente com ID:', id);
      const response = await clientAPI.getClient(id);
      console.log('Resposta completa da API:', response);
      
      if (response && response.success && response.data) {
        setClient(response);
        console.log('Cliente carregado com sucesso:', response.data.name);
      } else {
        console.log('Resposta da API não tem estrutura esperada:', response);
        throw new Error('Estrutura de resposta inválida');
      }
    } catch (err) {
      console.error('Erro detalhado ao carregar cliente:', err);
      console.error('ID usado:', id);
      console.error('Erro completo:', err.response || err);
      toast.error(`Erro ao carregar dados do cliente: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || sending) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setSending(true);

    try {
      // Testar mensagem com a IA
      const response = await clientAPI.testMessage(id, userMessage.text);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: response.data.response,
        confidence: response.data.confidence,
        matched_keyword: response.data.matched_keyword,
        is_default: response.data.is_default,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      
    } catch (err) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        text: `Erro ao processar mensagem: ${err.message}`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: 'system',
        text: 'Chat limpo! Digite uma nova mensagem para testar.',
        timestamp: new Date()
      }
    ]);
  };

  const suggestedMessages = [
    'Olá, qual o horário de funcionamento?',
    'Qual é o preço do serviço?',
    'Onde vocês ficam localizados?',
    'Como faço para entrar em contato?',
    'Vocês trabalham aos fins de semana?'
  ];

  if (loading) {
    return (
      <div className="test-chat">
        <div className="loading">
          <FaRobot className="loading-icon" />
          <p>Carregando chat de teste...</p>
        </div>
      </div>
    );
  }

  if (!client || !client.data) {
    return (
      <div className="test-chat">
        <div className="error">
          <FaTimesCircle className="error-icon" />
          <h3>Cliente não encontrado</h3>
          <p>ID buscado: {id}</p>
          <p>Clientes disponíveis: clinica_dr_silva, 01</p>
          <Link to="/clients" className="btn btn-primary">
            <FaArrowLeft /> Voltar para Lista
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="test-chat">
      <div className="page-header">
        <div className="header-actions">
          <Link to={`/client/${id}`} className="btn btn-secondary">
            <FaArrowLeft /> Voltar
          </Link>
          <button 
            className="btn btn-secondary"
            onClick={clearChat}
          >
            Limpar Chat
          </button>
          <Link 
            to={`/client/${id}/ia`}
            className="btn btn-primary"
          >
            <FaCog /> Configurar IA
          </Link>
        </div>
      </div>

      <div className="chat-container">
        <div className="chat-area">
          <div className="messages-container">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {sending && (
              <div className="message bot typing">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="message-input">
            <button 
              type="button"
              onClick={() => setShowSuggestions(true)}
              className="suggestions-btn"
              title="Ver sugestões de mensagens"
            >
              <FaLightbulb />
            </button>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              disabled={sending}
              className="input-field"
            />
            <button 
              type="submit" 
              disabled={!inputMessage.trim() || sending}
              className="send-btn"
            >
              <FaPaperPlane />
            </button>
          </form>
        </div>
      </div>

      {/* Popup de Sugestões */}
      {showSuggestions && (
        <div className="suggestions-popup-overlay" onClick={() => setShowSuggestions(false)}>
          <div className="suggestions-popup" onClick={(e) => e.stopPropagation()}>
            <div className="suggestions-header">
              <h4><FaLightbulb /> Mensagens sugeridas</h4>
              <button 
                className="close-btn"
                onClick={() => setShowSuggestions(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="suggestions-list">
              {suggestedMessages.map((suggestion, index) => (
                <button
                  key={index}
                  className="suggestion-btn"
                  onClick={() => {
                    setInputMessage(suggestion);
                    setShowSuggestions(false);
                  }}
                  disabled={sending}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente para bolha de mensagem
const MessageBubble = ({ message }) => {
  const getMessageIcon = () => {
    switch (message.type) {
      case 'user':
        return <FaUser />;
      case 'bot':
        return <FaRobot />;
      case 'system':
        return <FaCog />;
      case 'error':
        return <FaTimesCircle />;
      default:
        return <FaRobot />;
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return '#28a745'; // Verde
    if (confidence >= 0.6) return '#ffc107'; // Amarelo
    return '#dc3545'; // Vermelho
  };

  return (
    <div className={`message ${message.type}`}>
      <div className="message-icon">
        {getMessageIcon()}
      </div>
      <div className="message-content">
        {message.type === 'system' && message.text.includes('da ') ? (
          <div className="message-text">
            {(() => {
              const text = message.text;
              const beforeCompany = text.substring(0, text.indexOf('da ') + 3);
              const afterDa = text.substring(text.indexOf('da ') + 3);
              const exclamationIndex = afterDa.indexOf('!');
              const companyName = exclamationIndex !== -1 ? 
                afterDa.substring(0, exclamationIndex) : 
                afterDa.split(' ')[0];
              const restOfText = afterDa.substring(companyName.length);
              
              return (
                <>
                  {beforeCompany}
                  <strong className="company-name">{companyName}</strong>
                  {restOfText}
                </>
              );
            })()}
          </div>
        ) : (
          <div className="message-text">{message.text}</div>
        )}
        
        {message.type === 'bot' && (
          <div className="message-meta">
            <div className="meta-row">
              <span className="meta-label">Confiança:</span>
              <span 
                className="meta-value confidence"
                style={{ color: getConfidenceColor(message.confidence) }}
              >
                {Math.round(message.confidence * 100)}%
              </span>
            </div>
            
            {message.matched_keyword && (
              <div className="meta-row">
                <span className="meta-label">Palavra-chave:</span>
                <span className="meta-value keyword">"{message.matched_keyword}"</span>
              </div>
            )}
            
            <div className="meta-row">
              <span className="meta-label">Tipo:</span>
              <span className={`meta-value type ${message.is_default ? 'default' : 'ai'}`}>
                {message.is_default ? (
                  <>
                    <FaTimesCircle /> Resposta Padrão
                  </>
                ) : (
                  <>
                    <FaCheckCircle /> Resposta da IA
                  </>
                )}
              </span>
            </div>
          </div>
        )}
        
        <div className="message-time">
          {message.timestamp.toLocaleTimeString('pt-BR')}
        </div>
      </div>
    </div>
  );
};

export default TestChat;
