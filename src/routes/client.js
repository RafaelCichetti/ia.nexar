const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const IAService = require('../services/IAService');

// POST /client - Criar novo cliente e usuário principal
const User = require('../models/User');
router.post('/', async (req, res) => {
  try {
    const {
      name,
      phone_number,
      cnpj_cpf,
      endereco,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      cep,
      email,
      senha
    } = req.body;

    if (!name || !phone_number || !email || !senha) {
      return res.status(400).json({
        error: 'Campos obrigatórios: name, phone_number, email, senha'
      });
    }

    // Verifica se já existe usuário com o mesmo e-mail
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Já existe um usuário com este e-mail' });
    }

    const newClient = new Client({
      name,
      phone_number,
      cnpj_cpf,
      endereco,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      cep
    });

    await newClient.save();

    // Cria usuário principal do cliente
    const user = await User.create({
      nome: name,
      email,
      senha,
      tipo: 'cliente',
      client_id: newClient.client_id
    });

    res.status(201).json({
      success: true,
      message: 'Cliente e usuário criados com sucesso',
      data: {
        client_id: newClient.client_id,
        name: newClient.name,
        phone_number: newClient.phone_number,
        created_at: newClient.created_at,
        usuario: {
          id: user._id,
          nome: user.nome,
          email: user.email
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao criar cliente/usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// GET /client/:id - Buscar cliente por ID
router.get('/:id', async (req, res) => {
  try {
    const client = await Client.findOne({ client_id: req.params.id });

    if (!client) {
      return res.status(404).json({
        error: 'Cliente não encontrado'
      });
    }

    // Não retornar tokens sensíveis
    const clientData = client.toObject();
    delete clientData.whatsapp_token;
    delete clientData.verify_token;

    res.json({
      success: true,
      data: clientData
    });

  } catch (error) {
    console.error('❌ Erro ao buscar cliente:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// PUT /client/:id - Atualizar cliente
router.put('/:id', async (req, res) => {
  try {
    console.log('📝 Atualizando cliente:', req.params.id);
    console.log('📋 Dados recebidos:', req.body);
    
    const { 
      name, 
      phone_number, 
      whatsapp_token, 
      verify_token,
      default_response,
      active,
      ai_assistant_name,
      ai_instructions
    } = req.body;


    const updateData = {};
    if (name) updateData.name = name;
    if (phone_number) updateData.phone_number = phone_number;
    if (whatsapp_token) updateData.whatsapp_token = whatsapp_token;
    if (verify_token) updateData.verify_token = verify_token;
    if (default_response) updateData.default_response = default_response;
    if (typeof active === 'boolean') updateData.active = active;
    if (ai_assistant_name !== undefined) updateData.ai_assistant_name = ai_assistant_name;
    if (ai_instructions !== undefined) updateData.ai_instructions = ai_instructions;
    // Integração Google desativada: ignorar quaisquer campos google_oauth/google_calendar_tokens
    if (req.body.google_oauth || req.body.google_calendar_tokens) {
      console.log('ℹ️ Campos Google ignorados (integração desativada).');
    }

    console.log('💾 Dados para atualização:', updateData);

  // Atualização direta (sem campos Google)
  const updateQuery = updateData;

    let client = await Client.findOneAndUpdate(
      { client_id: req.params.id },
      updateQuery,
      { new: true }
    );

  // Integração Google desativada: nenhuma atualização complementar

    if (!client) {
      return res.status(404).json({
        error: 'Cliente não encontrado'
      });
    }

    // Não retornar tokens sensíveis
    const clientData = client.toObject();
    delete clientData.whatsapp_token;
    delete clientData.verify_token;

  // Remover campos Google da resposta por segurança
  delete clientData.google_oauth;
  delete clientData.google_calendar_tokens;

    res.json({
      success: true,
      message: 'Cliente atualizado com sucesso',
      data: clientData
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar cliente:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// POST /client/:id/ia - Adicionar configuração de IA
router.post('/:id/ia', async (req, res) => {
  try {
    const { keyword, response } = req.body;

    if (!keyword || !response) {
      return res.status(400).json({
        error: 'Campos obrigatórios: keyword, response'
      });
    }

    const result = await IAService.addIAConfig(req.params.id, keyword, response);

    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.status(201).json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('❌ Erro ao adicionar configuração de IA:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// DELETE /client/:id/ia/:configId - Remover configuração de IA
router.delete('/:id/ia/:configId', async (req, res) => {
  try {
    const result = await IAService.removeIAConfig(req.params.id, req.params.configId);

    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('❌ Erro ao remover configuração de IA:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// GET /client/:id/stats - Obter estatísticas avançadas do cliente
router.get('/:id/stats', async (req, res) => {
  try {
    const client = await Client.findOne({ client_id: req.params.id });

    if (!client) {
      return res.status(404).json({
        error: 'Cliente não encontrado'
      });
    }


    // Buscar logs de conversa dos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const ConversationLog = require('../models/ConversationLog');

    // LOG ESPECIAL: mostrar todos os logs do dia atual para depuração
    const hoje = new Date();
    hoje.setHours(0,0,0,0);
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);
    const logsHoje = await ConversationLog.find({
      client_id: req.params.id,
      created_at: { $gte: hoje, $lt: amanha }
    }).sort({ created_at: 1 });
    console.log('🟢 LOGS DE HOJE PARA DASHBOARD:', logsHoje.map(l => ({ created_at: l.created_at, user_phone: l.user_phone, msg: l.user_message })));

  // Estatísticas básicas
  const [totalConversations, monthlyConversations, totalTokens, totalCost] = await Promise.all([
      ConversationLog.countDocuments({ client_id: req.params.id }),
      ConversationLog.countDocuments({ 
        client_id: req.params.id, 
        created_at: { $gte: thirtyDaysAgo } 
      }),
      ConversationLog.aggregate([
        { $match: { client_id: req.params.id } },
        { $group: { _id: null, total: { $sum: '$tokens_used' } } }
      ]),
      ConversationLog.aggregate([
        { $match: { client_id: req.params.id } },
        { $group: { _id: null, total: { $sum: '$cost_usd' } } }
      ])
    ]);

    // Estatísticas por modelo
    const modelStats = await ConversationLog.aggregate([
      { $match: { client_id: req.params.id } },
      { 
        $group: { 
          _id: '$model_used', 
          count: { $sum: 1 },
          tokens: { $sum: '$tokens_used' },
          cost: { $sum: '$cost_usd' },
          avg_response_time: { $avg: '$response_time_ms' }
        }
      }
    ]);

    // Conversas por dia (últimos 30 dias)
    // Logar todos os registros brutos para depuração
    const logsBrutos = await ConversationLog.find({
      client_id: req.params.id,
      created_at: { $gte: thirtyDaysAgo }
    }).sort({ created_at: -1 });
    console.log('🟡 LOGS BRUTOS PARA DASHBOARD:', logsBrutos.map(l => ({ created_at: l.created_at, user_phone: l.user_phone, msg: l.user_message })));
  const dailyStats = await ConversationLog.aggregate([
      { 
        $match: { 
          client_id: req.params.id, 
          created_at: { $gte: thirtyDaysAgo } 
        } 
      },
      {
        $addFields: {
          created_at_brasilia: {
            $dateToParts: {
              date: "$created_at",
              timezone: "America/Sao_Paulo"
            }
          }
        }
      },
      {
        $group: {
          _id: {
            day: "$created_at_brasilia.day",
            month: "$created_at_brasilia.month",
            year: "$created_at_brasilia.year"
          },
          conversations: { $sum: 1 },
          tokens: { $sum: "$tokens_used" },
          cost: { $sum: "$cost_usd" }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

  // Log de depuração para dailyStats
  console.log('📊 dailyStats:', JSON.stringify(dailyStats, null, 2));

    // Usuários únicos
    const uniqueUsers = await ConversationLog.distinct('user_phone', { client_id: req.params.id });

    res.json({
      success: true,
      data: {
        client_info: {
          client_id: client.client_id,
          name: client.name,
          active: client.active,
          ai_assistant_name: client.ai_assistant_name,
          has_custom_instructions: !!client.ai_instructions,
          created_at: client.created_at,
          updated_at: client.updated_at
        },
        statistics: {
          total_conversations: totalConversations,
          monthly_conversations: monthlyConversations,
          unique_users: uniqueUsers.length,
          total_tokens: totalTokens[0]?.total || 0,
          total_cost_usd: totalCost[0]?.total || 0,
          avg_cost_per_conversation: totalConversations > 0 ? (totalCost[0]?.total || 0) / totalConversations : 0,
          ai_responses: client.stats?.ai_responses || 0,
          last_message: client.stats?.last_message || null
        },
        // Compatibilidade: incluir stats bruto do cliente
        stats: client.stats || {},
        model_usage: modelStats,
        daily_stats: dailyStats,
        current_model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        openai_status: !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-your-openai-api-key-here'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas avançadas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// GET /client/:id/report - Gerar relatório em PDF
router.get('/:id/report', async (req, res) => {
  try {
    const client = await Client.findOne({ client_id: req.params.id });

    if (!client) {
      return res.status(404).json({
        error: 'Cliente não encontrado'
      });
    }

    // Por enquanto retornar JSON com os dados do relatório
    // TODO: Implementar geração de PDF
    const reportData = {
      client_name: client.name,
      client_id: client.client_id,
      report_date: new Date().toISOString(),
      period: req.query.period || '30_days',
      data: {
        // Dados serão coletados baseado no período
        summary: 'Relatório será implementado em breve'
      }
    };

    res.json({
      success: true,
      message: 'Funcionalidade de relatório PDF será implementada em breve',
      data: reportData
    });

  } catch (error) {
    console.error('❌ Erro ao gerar relatório:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// GET /client/:id/stats - Obter estatísticas do cliente (rota antiga para compatibilidade)
router.get('/:id/stats-old', async (req, res) => {
  try {
    const client = await Client.findOne({ client_id: req.params.id });

    if (!client) {
      return res.status(404).json({
        error: 'Cliente não encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        client_id: client.client_id,
        name: client.name,
        stats: client.stats,
        ia_config_count: client.ia_config.length,
        active: client.active,
        created_at: client.created_at,
        updated_at: client.updated_at
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// GET /client - Listar todos os clientes (apenas admin)
const { auth } = require('./auth');
router.get('/', auth, async (req, res) => {
  if (!req.user || req.user.tipo !== 'admin') {
    return res.status(403).json({ success: false, error: 'Acesso negado: apenas administradores' });
  }
  try {
    const clients = await Client.find({}, {
      whatsapp_token: 0,
      verify_token: 0
    });

    res.json({
      success: true,
      data: clients,
      total: clients.length
    });

  } catch (error) {
    console.error('❌ Erro ao listar clientes:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// DELETE /client/:id - Deletar cliente
router.delete('/:id', async (req, res) => {
  try {
    // Tenta deletar por client_id (numérico) ou _id (ObjectId)

    let client = await Client.findOneAndDelete({ client_id: req.params.id });
    if (!client) {
      client = await Client.findByIdAndDelete(req.params.id);
    }
    if (!client) {
      return res.status(404).json({
        error: 'Cliente não encontrado'
      });
    }

    // Remove o usuário principal vinculado a este client_id
    await User.deleteMany({ client_id: client.client_id });

    res.json({
      success: true,
      message: 'Cliente e usuário(s) deletados com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao deletar cliente:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
