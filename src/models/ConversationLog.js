const mongoose = require('mongoose');

const ConversationLogSchema = new mongoose.Schema({
  client_id: {
    type: String,
    required: true,
    ref: 'Client'
  },
  user_phone: {
    type: String,
    required: true
  },
  user_message: {
    type: String,
    required: true
  },
  ai_response: {
    type: String,
    required: true
  },
  model_used: {
    type: String,
    default: 'gpt-3.5-turbo'
  },
  tokens_used: {
    type: Number,
    default: 0
  },
  cost_usd: {
    type: Number,
    default: 0
  },
  response_time_ms: {
    type: Number,
    default: 0
  },
  context_used: {
    type: Boolean,
    default: false
  },
  success: {
    type: Boolean,
    default: true
  },
  error_message: {
    type: String,
    default: null
  },
  metadata: {
    prompt_tokens: Number,
    completion_tokens: Number,
    temperature: Number,
    user_sentiment: String
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Índices para otimizar consultas
ConversationLogSchema.index({ client_id: 1, created_at: -1 });
ConversationLogSchema.index({ user_phone: 1, created_at: -1 });

// Método para obter estatísticas de conversa
ConversationLogSchema.statics.getClientStats = async function(clientId, dias = 30) {
  const dataInicio = new Date();
  dataInicio.setDate(dataInicio.getDate() - dias);
  
  const stats = await this.aggregate([
    {
      $match: {
        client_id: clientId,
        created_at: { $gte: dataInicio }
      }
    },
    {
      $group: {
        _id: null,
        total_conversas: { $sum: 1 },
        total_tokens: { $sum: '$tokens_used' },
        custo_total: { $sum: '$cost_usd' },
        tempo_resposta_medio: { $avg: '$response_time_ms' },
        taxa_sucesso: {
          $avg: { $cond: ['$success', 1, 0] }
        }
      }
    }
  ]);
  
  return stats[0] || {
    total_conversas: 0,
    total_tokens: 0,
    custo_total: 0,
    tempo_resposta_medio: 0,
    taxa_sucesso: 0
  };
};

const ConversationLog = mongoose.model('ConversationLog', ConversationLogSchema);

module.exports = ConversationLog;
