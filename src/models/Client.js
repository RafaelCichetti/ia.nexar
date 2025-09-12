const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const IAConfigSchema = new mongoose.Schema({
  keyword: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  response: {
    type: String,
    required: true,
    trim: true
  },
  variations: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  category: {
    type: String,
    default: 'general',
    enum: ['greeting', 'product', 'service', 'support', 'complaint', 'general']
  },
  confidence_threshold: {
    type: Number,
    default: 0.5,
    min: 0,
    max: 1
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const ClientSchema = new mongoose.Schema({
  // Integração Google removida
  client_id: {
    type: Number,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone_number: {
    type: String,
    required: true,
    trim: true
  },
  whatsapp_token: {
    type: String
  },
  verify_token: {
    type: String
  },
  ia_config: [IAConfigSchema],
  ai_personality: {
    tone: {
      type: String,
      default: 'friendly',
      enum: ['formal', 'friendly', 'casual', 'professional']
    },
    business_type: {
      type: String,
      default: 'general',
      enum: ['restaurant', 'clinic', 'store', 'service', 'general']
    },
    greeting_style: {
      type: String,
      default: 'warm',
      enum: ['warm', 'professional', 'casual', 'enthusiastic']
    },
    response_length: {
      type: String,
      default: 'medium',
      enum: ['short', 'medium', 'detailed']
    }
  },
  business_info: {
    type: String,
    default: '',
    maxlength: 1000
  },
  ai_instructions: {
    type: String,
    default: '',
    maxlength: 2000
  },
  ai_assistant_name: {
    type: String,
    default: '',
    maxlength: 50,
    trim: true
  },
  ai_features: {
    use_openai: {
      type: Boolean,
      default: true
    },
    maintain_context: {
      type: Boolean,
      default: true
    },
    log_conversations: {
      type: Boolean,
      default: true
    },
    custom_prompt: {
      type: String,
      default: ''
    }
  },
  default_response: {
    type: String,
    default: "Desculpe, não entendi. Pode repetir?"
  },
  active: {
    type: Boolean,
    default: true
  },
  stats: {
    total_messages: {
      type: Number,
      default: 0
    },
    ai_responses: {
      type: Number,
      default: 0
    },
    default_responses: {
      type: Number,
      default: 0
    },
    last_message: {
      type: Date,
      default: null
    }
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  endereco: {
    type: String,
    trim: true
  },
  numero: {
    type: String,
    trim: true
  },
  complemento: {
    type: String,
    trim: true
  },
  bairro: {
    type: String,
    trim: true
  },
  cidade: {
    type: String,
    trim: true
  },
  estado: {
    type: String,
    trim: true
  },
  cep: {
    type: String,
    trim: true
  }
});

ClientSchema.plugin(AutoIncrement, { inc_field: 'client_id' });

// Middleware para atualizar updated_at antes de salvar
ClientSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Método para adicionar configuração de IA
ClientSchema.methods.addIAConfig = function(keyword, response) {
  this.ia_config.push({ keyword: keyword.toLowerCase(), response });
  return this.save();
};

// Método para remover configuração de IA
ClientSchema.methods.removeIAConfig = function(configId) {
  this.ia_config.id(configId).remove();
  return this.save();
};

// Método para buscar resposta baseada em palavra-chave
ClientSchema.methods.findResponse = function(message) {
  const messageText = message.toLowerCase();
  
  // Procura por palavra-chave que contenha no texto
  const matchedConfig = this.ia_config.find(config => 
    messageText.includes(config.keyword.toLowerCase())
  );
  
  if (matchedConfig) {
    this.stats.ai_responses += 1;
    return matchedConfig.response;
  } else {
    this.stats.default_responses += 1;
    return this.default_response;
  }
};

// Método para atualizar estatísticas
ClientSchema.methods.updateStats = function() {
  this.stats.total_messages += 1;
  this.stats.last_message = new Date();
  return this.save();
};

module.exports = mongoose.model('Client', ClientSchema);
