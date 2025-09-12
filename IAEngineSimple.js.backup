const OpenAI = require('openai');

class IAEngine {
  constructor() {
    console.log('IAEngine constructor chamado');
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-your-openai-api-key-here') {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    } else {
      this.openai = null;
      console.log('⚠️  OpenAI API Key não configurada - usando modo simulação');
    }
    this.conversationCache = new Map();
  }

  async gerarResposta(mensagem, dadosDoCliente, telefoneUsuario) {
    console.log('gerarResposta chamado');
    return {
      resposta: 'Teste',
      config: {
        ai_assistant_name: 'Teste',
        ia_ativa: true
      }
    };
  }
}

module.exports = IAEngine;
