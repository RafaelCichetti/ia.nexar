const OpenAI = require('openai');

class IAEngine {
  constructor() {
    console.log(' VERSAO FINAL DEBUG - CONSTRUCTOR ');
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-your-openai-api-key-here') {
      console.log(' API Key encontrada, inicializando OpenAI...');
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      console.log(' OpenAI inicializado com sucesso');
    } else {
      this.openai = null;
      console.log('  OpenAI não configurado');
    }
    this.conversationCache = new Map();
  }

  async gerarResposta(mensagem, dadosDoCliente, telefoneUsuario) {
    console.log(' GERARRESPOSTA VERSAO FINAL DEBUG');
    
    if (!this.openai) {
      console.log('  Modo demo - sem OpenAI');
      return {
        resposta: 'Resposta demo',
        config: { ai_assistant_name: 'Demo', ia_ativa: false }
      };
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'user', content: mensagem }
        ],
        max_tokens: 100
      });

      return {
        sucesso: true,
        resposta: response.choices[0].message.content,
        modelo: 'gpt-3.5-turbo'
      };
    } catch (error) {
      console.error(' Erro OpenAI:', error.message);
      return {
        sucesso: false,
        resposta: 'Erro na IA',
        erro: error.message
      };
    }
  }
}

module.exports = IAEngine;
