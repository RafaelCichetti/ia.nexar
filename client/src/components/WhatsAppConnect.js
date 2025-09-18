import React, { useState, useEffect } from 'react';
import { FiWifi, FiWifiOff, FiRefreshCw, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './WhatsAppConnect.css';

const WhatsAppConnect = ({ clientId, clientName }) => {
  const [qrCode, setQrCode] = useState('');
  const [status, setStatus] = useState('disconnected');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Verificar status a cada 3 segundos
  useEffect(() => {
    // Buscar QR Code
    const fetchQRCode = async () => {
      try {
        const response = await fetch(`/whatsapp/${clientId}/qrcode`);
        const data = await response.json();
        
        if (data.success && data.qrCode) {
          setQrCode(data.qrCode);
        }
      } catch (error) {
        console.error('Erro ao buscar QR code:', error);
      }
    };

    // Verificar status da conexão
    const checkStatus = async () => {
      try {
        const response = await fetch(`/whatsapp/${clientId}/status`);
        const data = await response.json();
        
        if (data.success) {
          setStatus(data.status);
          setMessage(data.message);
          
          // Se status mudou para ready, limpar QR code
          if (data.status === 'ready') {
            setQrCode('');
          }
          
          // Se tem QR code disponível, buscar
          if (data.hasQrCode && data.status === 'qr_ready') {
            await fetchQRCode();
          }
          
          if (data.qrCode) {
            setQrCode(data.qrCode);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      }
    };

    if (clientId) {
      checkStatus();
      const interval = setInterval(checkStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [clientId]);

  // Atualizar QR code manualmente
  const refreshQRCode = async () => {
    try {
      const response = await fetch(`/whatsapp/${clientId}/qrcode`);
      const data = await response.json();
      
      if (data.success && data.qrCode) {
        setQrCode(data.qrCode);
        toast.success('QR Code atualizado');
      } else {
        toast.error('Erro ao atualizar QR Code');
      }
    } catch (error) {
      console.error('Erro ao buscar QR code:', error);
      toast.error('Erro ao atualizar QR Code');
    }
  };

  // Conectar WhatsApp
  const connectWhatsApp = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/whatsapp/${clientId}/connect`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Iniciando conexão...');
        setStatus('connecting');
      } else {
        toast.error(data.message || 'Erro ao conectar');
      }
    } catch (error) {
      console.error('Erro ao conectar:', error);
      toast.error('Erro ao conectar WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  // Desconectar WhatsApp
  const disconnectWhatsApp = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/whatsapp/${clientId}/disconnect`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('WhatsApp desconectado');
        setStatus('disconnected');
        setQrCode('');
        setMessage('');
      } else {
        toast.error(data.message || 'Erro ao desconectar');
      }
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      toast.error('Erro ao desconectar WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  // Obter ícone baseado no status
  const getStatusIcon = () => {
    switch (status) {
      case 'ready':
        return <FiCheck className="status-icon success" />;
      case 'connecting':
      case 'qr_ready':
      case 'authenticated':
        return <FiRefreshCw className="status-icon warning rotating" />;
      case 'disconnected':
      default:
        return <FiWifiOff className="status-icon error" />;
    }
  };

  // Obter classe CSS baseada no status
  const getStatusClass = () => {
    switch (status) {
      case 'ready':
        return 'success';
      case 'connecting':
      case 'qr_ready':
      case 'authenticated':
        return 'warning';
      case 'disconnected':
      default:
        return 'error';
    }
  };

  return (
    <div className="whatsapp-connect">
      <div className="whatsapp-header">
        <div className="status-info">
          {getStatusIcon()}
          <div className="status-details">
            <h4>WhatsApp - {clientName}</h4>
            <p className={`status-text ${getStatusClass()}`}>
              {message || 'Status desconhecido'}
            </p>
          </div>
        </div>
        
        <div className="connection-actions">
          {status === 'disconnected' && (
            <button 
              className="btn btn-primary"
              onClick={connectWhatsApp}
              disabled={loading}
            >
              {loading ? <FiRefreshCw className="rotating" /> : <FiWifi />}
              Conectar
            </button>
          )}
          
          {(status === 'ready' || status === 'connecting' || status === 'qr_ready' || status === 'authenticated') && (
            <button 
              className="btn btn-secondary"
              onClick={disconnectWhatsApp}
              disabled={loading}
            >
              <FiWifiOff />
              Desconectar
            </button>
          )}
        </div>
      </div>

      {/* QR Code */}
      {qrCode && status === 'qr_ready' && (
        <div className="qr-section">
          <div className="qr-instructions">
            <FiAlertCircle />
            <div>
              <h5>Escaneie o QR Code</h5>
              <p>
                Abra o WhatsApp no seu celular, vá em <strong>Dispositivos Conectados</strong> 
                e escaneie este código.
              </p>
            </div>
          </div>
          
          <div className="qr-container">
            <img 
              src={`data:image/png;base64,${qrCode}`}
              alt="QR Code WhatsApp"
              className="qr-image"
            />
          </div>
          
          <div className="qr-actions">
            <button 
              className="btn btn-outline"
              onClick={refreshQRCode}
              disabled={loading}
            >
              <FiRefreshCw />
              Atualizar QR Code
            </button>
          </div>
        </div>
      )}

      {/* Status de carregamento */}
      {(status === 'connecting' || status === 'authenticated') && !qrCode && (
        <div className="loading-section">
          <FiRefreshCw className="loading-icon rotating" />
          <p>Conectando ao WhatsApp...</p>
        </div>
      )}

      {/* Status conectado */}
      {status === 'ready' && (
        <div className="success-section">
          <FiCheck className="success-icon" />
          <div>
            <h5>✅ WhatsApp Conectado!</h5>
            <p>Seu assistente de IA está pronto para receber mensagens.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppConnect;
