const express = require('express');
const router = express.Router();
const WhatsAppService = require('../services/WhatsAppService');
const Client = require('../models/Client');

// Conectar WhatsApp de um cliente (gera QR Code)
router.post('/:clientId/connect', async (req, res) => {
  try {
    const { clientId } = req.params;
    
    // Buscar dados do cliente
    const clientData = await Client.findOne({ client_id: clientId });
    if (!clientData) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    // Verificar se já está conectado
    const status = await WhatsAppService.getConnectionStatus(clientId);
    if (status.success && status.status === 'ready') {
      return res.json({
        success: true,
        message: 'WhatsApp já conectado',
        status: 'ready'
      });
    }

    // Criar nova sessão
    const result = await WhatsAppService.createClientSession(clientId, clientData);
    if (!result?.success) {
      return res.status(500).json({
        success: false,
        message: result?.message || 'Falha ao iniciar sessão do WhatsApp'
      });
    }
    res.json({
      success: true,
      message: 'Conectando ao WhatsApp...',
      status: 'connecting'
    });

  } catch (error) {
    console.error('❌ Erro ao conectar WhatsApp:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Obter QR Code de um cliente
router.get('/:clientId/qrcode', async (req, res) => {
  try {
    const { clientId } = req.params;
    
    const qrCode = await WhatsAppService.getQRCode(clientId);
    const status = await WhatsAppService.getConnectionStatus(clientId);
    
    if (!qrCode.success && status.status !== 'ready') {
      return res.status(404).json({
        success: false,
        message: 'QR Code não disponível. Inicie a conexão primeiro.'
      });
    }

    res.json({
      success: true,
      qrCode: qrCode.qrCode,
      status: status.status,
      message: status.status === 'ready' ? 'WhatsApp conectado' : 'Escaneie o QR Code'
    });

  } catch (error) {
    console.error('❌ Erro ao obter QR Code:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Obter QR Code como PNG (útil para abrir no navegador)
router.get('/:clientId/qr.png', async (req, res) => {
  try {
    const { clientId } = req.params;
    const qrCode = await WhatsAppService.getQRCode(clientId);
    if (!qrCode.success || !qrCode.qrCode) {
      return res.status(404).json({ success: false, message: 'QR Code não disponível' });
    }
    const img = Buffer.from(qrCode.qrCode, 'base64');
    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'no-store');
    res.send(img);
  } catch (error) {
    console.error('❌ Erro ao obter QR PNG:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Obter status da conexão
router.get('/:clientId/status', async (req, res) => {
  try {
    const { clientId } = req.params;
    
    const statusResult = await WhatsAppService.getConnectionStatus(clientId);
    
    res.json({
      success: true,
      status: statusResult.status,
      hasQrCode: statusResult.hasQrCode,
      message: statusResult.message,
      qrCode: statusResult.qrCode
    });

  } catch (error) {
    console.error('❌ Erro ao obter status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Desconectar WhatsApp de um cliente
router.post('/:clientId/disconnect', async (req, res) => {
  try {
    const { clientId } = req.params;
    
    const result = await WhatsAppService.disconnectClient(clientId);
    
    res.json(result);

  } catch (error) {
    console.error('❌ Erro ao desconectar WhatsApp:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Resetar sessão local (apaga credenciais salvas) e desconecta
router.post('/:clientId/reset', async (req, res) => {
  try {
    const { clientId } = req.params;
    const result = await WhatsAppService.resetSession(clientId);
    res.json(result);
  } catch (error) {
    console.error('❌ Erro ao resetar sessão WhatsApp:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Enviar mensagem teste
router.post('/:clientId/send-test', async (req, res) => {
  try {
    const { clientId } = req.params;
    const { phoneNumber, message } = req.body;
    
    if (!phoneNumber || !message) {
      return res.status(400).json({
        success: false,
        message: 'Número de telefone e mensagem são obrigatórios'
      });
    }

    const result = await WhatsAppService.sendTestMessage(clientId, phoneNumber, message);
    
    res.json(result);

  } catch (error) {
    console.error('❌ Erro ao enviar mensagem teste:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Listar todos os clientes conectados
router.get('/connected', async (req, res) => {
  try {
    const connected = WhatsAppService.getConnectedClients();
    
    res.json({
      success: true,
      clients: connected
    });

  } catch (error) {
    console.error('❌ Erro ao listar clientes conectados:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Função auxiliar para mensagens de status
function getStatusMessage(status) {
  switch (status) {
    case 'connecting':
      return 'Conectando ao WhatsApp...';
    case 'qr_ready':
      return 'QR Code pronto. Escaneie com seu WhatsApp.';
    case 'authenticated':
      return 'Autenticado. Iniciando conexão...';
    case 'ready':
      return 'WhatsApp conectado e funcionando!';
    case 'disconnected':
      return 'Desconectado do WhatsApp';
    default:
      return 'Status desconhecido';
  }
}

module.exports = router;
