const express = require('express');
const router = express.Router();
const WhatsAppService = require('../services/WhatsAppService');
const IAEngine = require('../services/IAEngineNovo');
const Client = require('../models/Client');
const ConversationLog = require('../models/ConversationLog');

// Instância do motor de IA real - VERSÃO NOVA LIMPA
const iaEngine = new IAEngine();

// GET /webhook - Verificação do webhook do WhatsApp
router.get('/', (req, res) => {
  console.log('🔍 Verificação do webhook recebida:', req.query);
  WhatsAppService.verifyWebhook(req, res);
});

// POST /webhook - Receber mensagens do WhatsApp
router.post('/', async (req, res) => {
  try {
    console.log('📥 Webhook recebido:', JSON.stringify(req.body, null, 2));
    
    // Processar mensagem do webhook
    const messageData = WhatsAppService.processWebhookMessage(req.body);
    
    if (!messageData) {
      console.log('ℹ️ Webhook ignorado - não é uma mensagem válida');
      return res.sendStatus(200);
    }

    console.log('📱 Mensagem processada:', messageData);

    // Identificar cliente baseado no client_id
    const client = await Client.findOne({ 
      client_id: messageData.to,
      active: true 
    });

    if (!client) {
      console.log(`❌ Cliente não encontrado para phone_number_id: ${messageData.to}`);
      return res.sendStatus(200);
    }

    console.log(`✅ Cliente identificado: ${client.name} (${client.client_id})`);

    // Processar mensagem com IA Real (OpenAI)
    console.log('� Processando com IA Real (ChatGPT)...');
    
    const startTime = Date.now();
    const aiResponse = await iaEngine.gerarResposta(
      messageData.text,
      client,
      messageData.from
    );
    const responseTime = Date.now() - startTime;
    
    if (!aiResponse.sucesso) {
      console.error('❌ Erro na IA:', aiResponse.erro);
    }

    console.log('🧠 Resposta da IA:', {
      modelo: aiResponse.modelo,
      tokens: aiResponse.tokens_usados,
      custo: aiResponse.custo_estimado,
      tempo: `${responseTime}ms`,
      sucesso: aiResponse.sucesso
    });

    // Enviar resposta via WhatsApp
    try {
      await WhatsAppService.sendMessage(
        messageData.to,
        messageData.from,
        aiResponse.resposta,
        client.whatsapp_token
      );

      // Gerar dataBrasilia e logar
      const dataBrasilia = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
      console.log('🕒 Salvando ConversationLog com created_at:', dataBrasilia.toISOString(), '| Local:', dataBrasilia.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }));
      await ConversationLog.create({
        client_id: client.client_id,
        user_phone: messageData.from,
        user_message: messageData.text,
        ai_response: aiResponse.resposta,
        model_used: aiResponse.modelo || 'gpt-3.5-turbo',
        tokens_used: aiResponse.tokens_usados || 0,
        cost_usd: parseFloat(aiResponse.custo_estimado || 0),
        response_time_ms: responseTime,
        context_used: aiResponse.metadata?.contexto_usado || false,
        success: aiResponse.sucesso,
        error_message: aiResponse.erro || null,
        metadata: aiResponse.metadata || {},
        created_at: dataBrasilia
      });

      // Atualizar estatísticas do cliente
      await Client.findByIdAndUpdate(client._id, {
        $inc: { 
          'stats.total_messages': 1,
          'stats.ai_responses': aiResponse.sucesso ? 1 : 0,
          'stats.tokens_used': aiResponse.tokens_usados || 0
        },
        $set: { 
          'stats.last_message': new Date(),
          'stats.last_activity': new Date(),
          'stats.last_cost_usd': parseFloat(aiResponse.custo_estimado || 0)
        }
      });

      console.log('✅ Resposta enviada via WhatsApp');
      console.log('📝 Resposta:', aiResponse.resposta.substring(0, 150) + '...');

      // Marcar mensagem original como lida
      await WhatsAppService.markAsRead(
        messageData.to,
        messageData.messageId,
        client.whatsapp_token
      );

      console.log('✅ Resposta enviada com sucesso');
      
      // Log da interação para análise
      console.log('📊 Interação completa:', {
        client: client.name,
        client_id: client.client_id,
        user_phone: messageData.from,
        message: messageData.text,
        ai_response: aiResponse.resposta?.substring(0, 100) + '...',
        model: aiResponse.modelo,
        tokens: aiResponse.tokens_usados,
        cost: aiResponse.custo_estimado,
        success: aiResponse.sucesso
      });

    } catch (sendError) {
      console.error('❌ Erro ao enviar resposta:', sendError);
      
      // Registrar erro no log
      await ConversationLog.create({
        client_id: client.client_id,
        user_phone: messageData.from,
        user_message: messageData.text,
        ai_response: null,
        model_used: 'error',
        tokens_used: 0,
        cost_usd: 0,
        response_time_ms: responseTime,
        success: false,
        error_message: sendError.message,
        metadata: { error_type: 'whatsapp_send_failed' }
      });
      
      // Não retornamos erro para o WhatsApp para evitar reenvios
    }

    res.sendStatus(200);

  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    res.sendStatus(500);
  }
});

// POST /webhook/test - Endpoint para testar mensagens (desenvolvimento)
router.post('/test', async (req, res) => {
  try {
    const { client_id, message, phone = 'test_user' } = req.body;

    if (!client_id || !message) {
      return res.status(400).json({
        error: 'client_id e message são obrigatórios'
      });
    }

    // Buscar cliente
    const client = await Client.findOne({ client_id });
    if (!client) {
      return res.status(404).json({
        error: 'Cliente não encontrado'
      });
    }

    // Processar mensagem com IA Real (OpenAI)
    console.log('🧠 [TESTE] Processando com IA Real (ChatGPT)...');
    
    const startTime = Date.now();
    const aiResponse = await iaEngine.gerarResposta(
      message,
      client,
      phone
    );
    const responseTime = Date.now() - startTime;
    
    // Salvar log da conversa de teste (usar horário de Brasília)
    const dataBrasilia = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    console.log('🧪[TEST] Salvando ConversationLog com created_at:', dataBrasilia.toISOString());
    await ConversationLog.create({
      client_id: client.client_id,
      user_phone: phone,
      user_message: message,
      ai_response: aiResponse.resposta,
      model_used: aiResponse.modelo || 'gpt-3.5-turbo',
      tokens_used: aiResponse.tokens_usados || 0,
      cost_usd: parseFloat(aiResponse.custo_estimado || 0),
      response_time_ms: responseTime,
      context_used: aiResponse.metadata?.contexto_usado || false,
      success: aiResponse.sucesso,
      error_message: aiResponse.erro || null,
      metadata: { ...aiResponse.metadata, test_mode: true },
      created_at: dataBrasilia
    });

    res.json({
      success: true,
      data: {
        original_message: message,
        response: aiResponse.resposta,
        ai_response: aiResponse.resposta,
        model_used: aiResponse.modelo,
        tokens_used: aiResponse.tokens_usados,
        cost_usd: aiResponse.custo_estimado,
        response_time_ms: responseTime,
        context_used: aiResponse.metadata?.contexto_usado || false,
        confidence: 0.95, // Para OpenAI, definimos alta confiança
        matched_keyword: null, // OpenAI não usa palavras-chave específicas
        is_default: !aiResponse.sucesso, // Se não teve sucesso, usou resposta padrão
        success: aiResponse.sucesso,
        error: aiResponse.erro || null
      }
    });

  } catch (error) {
    console.error('❌ Erro no teste:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// GET /webhook/status - Status do webhook
router.get('/status', (req, res) => {
  res.json({
    status: 'ativo',
    timestamp: new Date().toISOString(),
    message: 'Webhook do WhatsApp funcionando normalmente',
    endpoints: {
      verify: 'GET /webhook',
      receive: 'POST /webhook',
      test: 'POST /webhook/test'
    }
  });
});

module.exports = router;
