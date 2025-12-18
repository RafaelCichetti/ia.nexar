const mongoose = require('mongoose');

const CompromissoSchema = new mongoose.Schema({
  client_id: {
    type: Number,
    required: true,
    index: true
  },
  user_phone: {
    type: String,
    index: true,
    default: ''
  },
  nome_cliente: {
    type: String,
    required: true
  },
  procedimento: {
    type: String,
    required: true
  },
  descricao: {
    type: String,
    default: ''
  },
  data_inicio: {
    type: Date,
    required: true
  },
  data_fim: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['agendado', 'concluido', 'cancelado'],
    default: 'agendado'
  },
  reminder_30_sent: {
    type: Boolean,
    default: false
  },
  criado_por: {
    type: String,
    default: 'ia'
  },
  criado_em: {
    type: Date,
    default: Date.now
  },
  atualizado_em: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Compromisso', CompromissoSchema);
