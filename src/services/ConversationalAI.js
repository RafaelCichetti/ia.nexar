const natural = require('natural');
const sentiment = require('sentiment');

class ConversationalAI {
  constructor() {
    this.sentiment = new sentiment();
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmerPt; // Português
    this.conversationHistory = new Map(); // Histórico por cliente
    this.contextMemory = new Map(); // Memória de contexto
  }

  /**
   * Processa mensagem com IA conversacional
   * @param {string} message - Mensagem do usuário
   * @param {string} clientId - ID do cliente
   * @param {string} phoneNumber - Número do WhatsApp
   * @param {Object} clientConfig - Configuração do cliente
   * @returns {Object} Resposta da IA
   */
  async processMessage(message, clientId, phoneNumber, clientConfig) {
    try {
      // 1. Análise de sentimento
      const sentimentAnalysis = this.analyzeSentiment(message);
      
      // 2. Recuperar contexto da conversa
      const context = this.getConversationContext(phoneNumber, clientId);
      
      // 3. Extrair intenção e entidades
      const intent = this.extractIntent(message, clientConfig);
      const entities = this.extractEntities(message);
      
      // 4. Gerar resposta personalizada
      const response = await this.generatePersonalizedResponse(
        message, 
        intent, 
        entities, 
        sentimentAnalysis, 
        context, 
        clientConfig
      );
      
      // 5. Atualizar contexto da conversa
      this.updateConversationContext(phoneNumber, clientId, {
        userMessage: message,
        aiResponse: response.text,
        intent: intent,
        sentiment: sentimentAnalysis,
        timestamp: new Date()
      });
      
      return {
        text: response.text,
        confidence: response.confidence,
        intent: intent.name,
        sentiment: sentimentAnalysis.label,
        isPersonalized: true,
        responseType: response.type,
        metadata: {
          processingTime: Date.now(),
          contextUsed: context.length > 0,
          entities: entities
        }
      };
      
    } catch (error) {
      console.error('❌ Erro no processamento da IA:', error);
      return this.getFallbackResponse(clientConfig);
    }
  }

  /**
   * Análise de sentimento da mensagem
   */
  analyzeSentiment(message) {
    const result = this.sentiment.analyze(message);
    
    let label = 'neutral';
    if (result.score > 2) label = 'positive';
    else if (result.score < -2) label = 'negative';
    
    return {
      score: result.score,
      label: label,
      words: result.words
    };
  }

  /**
   * Extrai a intenção do usuário
   */
  extractIntent(message, clientConfig) {
    const normalizedMessage = message.toLowerCase().trim();
    const tokens = this.tokenizer.tokenize(normalizedMessage);
    
    // Stemming para melhor correspondência
    const stemmedTokens = tokens.map(token => this.stemmer.stem(token));
    
    let bestMatch = {
      name: 'unknown',
      confidence: 0,
      matchedKeywords: []
    };

    // Analisar configurações de IA do cliente
    for (const config of clientConfig.ia_config || []) {
      const confidence = this.calculateIntentConfidence(
        stemmedTokens, 
        config.keyword, 
        config.variations || []
      );
      
      if (confidence > bestMatch.confidence) {
        bestMatch = {
          name: config.keyword,
          confidence: confidence,
          matchedKeywords: [config.keyword],
          config: config
        };
      }
    }

    // Intenções gerais se não encontrar específica
    if (bestMatch.confidence < 0.3) {
      bestMatch = this.detectGeneralIntent(normalizedMessage);
    }

    return bestMatch;
  }

  /**
   * Calcula confiança da intenção
   */
  calculateIntentConfidence(tokens, keyword, variations = []) {
    const allKeywords = [keyword, ...variations].map(k => 
      this.stemmer.stem(k.toLowerCase())
    );
    
    let matches = 0;
    let partialMatches = 0;
    
    for (const token of tokens) {
      for (const kw of allKeywords) {
        if (token === kw) {
          matches += 1;
        } else if (token.includes(kw) || kw.includes(token)) {
          partialMatches += 0.5;
        }
      }
    }
    
    const totalScore = matches + partialMatches;
    return Math.min(totalScore / tokens.length, 1.0);
  }

  /**
   * Detecta intenções gerais
   */
  detectGeneralIntent(message) {
    const greetings = ['oi', 'olá', 'bom dia', 'boa tarde', 'boa noite', 'tudo bem'];
    const questions = ['como', 'quando', 'onde', 'quanto', 'qual', 'que'];
    const complaints = ['problema', 'erro', 'ruim', 'péssimo', 'reclamação'];
    const compliments = ['obrigado', 'muito bom', 'excelente', 'parabéns'];
    
    if (greetings.some(g => message.includes(g))) {
      return { name: 'greeting', confidence: 0.8, type: 'general' };
    }
    
    if (questions.some(q => message.includes(q))) {
      return { name: 'question', confidence: 0.7, type: 'general' };
    }
    
    if (complaints.some(c => message.includes(c))) {
      return { name: 'complaint', confidence: 0.9, type: 'general' };
    }
    
    if (compliments.some(c => message.includes(c))) {
      return { name: 'compliment', confidence: 0.8, type: 'general' };
    }
    
    return { name: 'unknown', confidence: 0.1, type: 'general' };
  }

  /**
   * Extrai entidades da mensagem (números, datas, emails, etc.)
   */
  extractEntities(message) {
    const entities = {};
    
    // Números de telefone
    const phoneRegex = /\(?\d{2}\)?\s?\d{4,5}-?\d{4}/g;
    const phones = message.match(phoneRegex);
    if (phones) entities.phones = phones;
    
    // Emails
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = message.match(emailRegex);
    if (emails) entities.emails = emails;
    
    // Valores monetários
    const moneyRegex = /R\$\s?\d+(?:,\d{2})?/g;
    const money = message.match(moneyRegex);
    if (money) entities.money = money;
    
    // CEP
    const cepRegex = /\d{5}-?\d{3}/g;
    const ceps = message.match(cepRegex);
    if (ceps) entities.ceps = ceps;
    
    return entities;
  }

  /**
   * Gera resposta personalizada baseada no contexto
   */
  async generatePersonalizedResponse(message, intent, entities, sentiment, context, clientConfig) {
    const businessName = clientConfig.name || 'Nossa empresa';
    const businessType = this.detectBusinessType(clientConfig);
    
    // Resposta baseada na intenção específica
    if (intent.config && intent.confidence > 0.5) {
      return this.enhanceSpecificResponse(intent.config, sentiment, entities, businessName);
    }
    
    // Respostas para intenções gerais
    switch (intent.name) {
      case 'greeting':
        return this.generateGreetingResponse(businessName, businessType, context);
      
      case 'question':
        return this.generateQuestionResponse(message, businessName, clientConfig);
      
      case 'complaint':
        return this.generateComplaintResponse(businessName, businessType);
      
      case 'compliment':
        return this.generateComplimentResponse(businessName);
      
      default:
        return this.generateUnknownResponse(businessName, clientConfig, context);
    }
  }

  /**
   * Melhora resposta específica com personalização
   */
  enhanceSpecificResponse(config, sentiment, entities, businessName) {
    let response = config.response;
    
    // Adicionar saudação baseada no sentimento
    if (sentiment.label === 'positive') {
      response = `😊 Que bom falar com você! ${response}`;
    } else if (sentiment.label === 'negative') {
      response = `Entendo sua preocupação. ${response}`;
    }
    
    // Personalizar com entidades encontradas
    if (entities.phones) {
      response += `\n\n📞 Vi que você mencionou um telefone. Se precisar de contato direto, pode me chamar aqui mesmo!`;
    }
    
    return {
      text: response,
      confidence: 0.9,
      type: 'specific_enhanced'
    };
  }

  /**
   * Gera saudação personalizada
   */
  generateGreetingResponse(businessName, businessType, context) {
    const greetings = [
      `Olá! Seja muito bem-vindo(a) ao ${businessName}! 😊`,
      `Oi! Que prazer ter você aqui no ${businessName}!`,
      `Olá! Como posso ajudar você hoje no ${businessName}?`
    ];
    
    let response = greetings[Math.floor(Math.random() * greetings.length)];
    
    // Se é retorno de cliente
    if (context.length > 0) {
      response = `Oi! Que bom ter você de volta! 😊 Como posso ajudar hoje?`;
    }
    
    // Adicionar sugestão baseada no tipo de negócio
    switch (businessType) {
      case 'restaurant':
        response += `\n\n🍕 Posso te ajudar com nosso cardápio, horários ou pedidos!`;
        break;
      case 'clinic':
        response += `\n\n🏥 Posso ajudar com agendamentos, informações ou resultados de exames!`;
        break;
      case 'store':
        response += `\n\n🛍️ Posso mostrar nossos produtos, ofertas ou esclarecer dúvidas!`;
        break;
      default:
        response += `\n\nEm que posso ajudar você hoje?`;
    }
    
    return {
      text: response,
      confidence: 0.8,
      type: 'greeting'
    };
  }

  /**
   * Detecta tipo de negócio
   */
  detectBusinessType(clientConfig) {
    const name = clientConfig.name?.toLowerCase() || '';
    const keywords = clientConfig.ia_config?.map(c => c.keyword).join(' ').toLowerCase() || '';
    
    if (name.includes('pizzaria') || name.includes('restaurante') || keywords.includes('cardápio')) {
      return 'restaurant';
    }
    
    if (name.includes('clínica') || name.includes('hospital') || keywords.includes('consulta')) {
      return 'clinic';
    }
    
    if (name.includes('loja') || name.includes('store') || keywords.includes('produto')) {
      return 'store';
    }
    
    return 'general';
  }

  /**
   * Gerencia contexto da conversa
   */
  getConversationContext(phoneNumber, clientId) {
    const key = `${clientId}_${phoneNumber}`;
    return this.conversationHistory.get(key) || [];
  }

  updateConversationContext(phoneNumber, clientId, interaction) {
    const key = `${clientId}_${phoneNumber}`;
    let history = this.conversationHistory.get(key) || [];
    
    history.push(interaction);
    
    // Manter apenas últimas 10 interações
    if (history.length > 10) {
      history = history.slice(-10);
    }
    
    this.conversationHistory.set(key, history);
  }

  /**
   * Resposta de fallback
   */
  getFallbackResponse(clientConfig) {
    return {
      text: clientConfig.default_response || "Desculpe, não consegui entender. Pode me explicar melhor?",
      confidence: 0.1,
      intent: 'fallback',
      sentiment: 'neutral',
      isPersonalized: false,
      responseType: 'fallback'
    };
  }

  // Métodos adicionais para outros tipos de resposta...
  generateQuestionResponse(message, businessName, clientConfig) {
    return {
      text: `Entendi que você tem uma dúvida! No ${businessName}, estou aqui para ajudar. Pode me dar mais detalhes sobre o que precisa saber?`,
      confidence: 0.7,
      type: 'question_handling'
    };
  }

  generateComplaintResponse(businessName, businessType) {
    return {
      text: `Sinto muito pelo inconveniente! No ${businessName}, levamos todas as questões muito a sério. Pode me contar o que aconteceu para que eu possa ajudar da melhor forma?`,
      confidence: 0.8,
      type: 'complaint_handling'
    };
  }

  generateComplimentResponse(businessName) {
    return {
      text: `Muito obrigado(a) pelo carinho! É um prazer atender você no ${businessName}! 😊 Se precisar de mais alguma coisa, estarei aqui!`,
      confidence: 0.8,
      type: 'compliment_response'
    };
  }

  generateUnknownResponse(businessName, clientConfig, context) {
    const responses = [
      `Hmm, não tenho certeza se entendi completamente. Pode me explicar melhor?`,
      `Desculpe, mas não consegui captar sua solicitação. Como posso ajudar você no ${businessName}?`,
      `Vou precisar de mais detalhes para te ajudar da melhor forma. Pode reformular sua pergunta?`
    ];
    
    return {
      text: responses[Math.floor(Math.random() * responses.length)],
      confidence: 0.3,
      type: 'unknown_clarification'
    };
  }
}

module.exports = ConversationalAI;
