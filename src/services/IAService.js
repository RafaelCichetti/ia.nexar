const Client = require('../models/Client');

class IAService {
  constructor() {
    this.confidence_threshold = 0.7; // Limiar de confiança para respostas
  }

  // Processar mensagem e gerar resposta
  async processMessage(clientId, message) {
    try {
      // Buscar cliente no banco de dados
      const client = await Client.findOne({ client_id: clientId, active: true });
      
      if (!client) {
        console.log(`❌ Cliente ${clientId} não encontrado ou inativo`);
        return {
          success: false,
          error: 'Cliente não encontrado'
        };
      }

      // Limpar e normalizar a mensagem
      const normalizedMessage = this.normalizeMessage(message);
      
      // Buscar resposta baseada nas configurações do cliente
      const response = this.findBestResponse(client, normalizedMessage);
      
      // Atualizar estatísticas do cliente
      await client.updateStats();
      
      console.log(`🤖 Resposta gerada para cliente ${clientId}: ${response.text.substring(0, 50)}...`);
      
      return {
        success: true,
        response: response.text,
        confidence: response.confidence,
        matched_keyword: response.keyword,
        is_default: response.isDefault
      };
      
    } catch (error) {
      console.error('❌ Erro ao processar mensagem:', error);
      return {
        success: false,
        error: 'Erro interno ao processar mensagem'
      };
    }
  }

  // Normalizar mensagem para melhor matching
  normalizeMessage(message) {
    return message
      .toLowerCase()
      .trim()
      .replace(/[^\w\sáéíóúâêîôûàèìòùäëïöüãõç]/g, '') // Remove pontuação, mantém acentos
      .replace(/\s+/g, ' '); // Remove espaços duplos
  }

  // Encontrar a melhor resposta baseada nas palavras-chave
  findBestResponse(client, normalizedMessage) {
    let bestMatch = {
      text: client.default_response,
      confidence: 0,
      keyword: null,
      isDefault: true
    };

    // Procurar por matches exatos ou parciais
    for (const config of client.ia_config) {
      const keyword = config.keyword.toLowerCase();
      const confidence = this.calculateConfidence(normalizedMessage, keyword);
      
      if (confidence > bestMatch.confidence && confidence >= this.confidence_threshold) {
        bestMatch = {
          text: config.response,
          confidence: confidence,
          keyword: config.keyword,
          isDefault: false
        };
      }
    }

    // Se não encontrou match suficiente, usar resposta padrão
    if (bestMatch.isDefault) {
      client.stats.default_responses += 1;
    } else {
      client.stats.ai_responses += 1;
    }

    return bestMatch;
  }

  // Calcular confiança do match entre mensagem e palavra-chave
  calculateConfidence(message, keyword) {
    // Match exato
    if (message === keyword) {
      return 1.0;
    }

    // Palavra-chave contida na mensagem
    if (message.includes(keyword)) {
      return 0.9;
    }

    // Mensagem contém a palavra-chave
    if (keyword.includes(message)) {
      return 0.8;
    }

    // Similaridade baseada em palavras comuns
    const messageWords = message.split(' ');
    const keywordWords = keyword.split(' ');
    
    let commonWords = 0;
    for (const word of messageWords) {
      if (keywordWords.includes(word) && word.length > 2) {
        commonWords++;
      }
    }

    if (commonWords > 0) {
      return Math.min(0.7, commonWords / Math.max(messageWords.length, keywordWords.length));
    }

    // Verificar palavras-chave fuzzy (similar)
    return this.calculateFuzzyMatch(message, keyword);
  }

  // Cálculo de match fuzzy simples
  calculateFuzzyMatch(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) {
      return 1.0;
    }
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  // Calcular distância de Levenshtein
  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  // Adicionar nova configuração de IA para cliente
  async addIAConfig(clientId, keyword, response) {
    try {
      const client = await Client.findOne({ client_id: clientId });
      
      if (!client) {
        return {
          success: false,
          error: 'Cliente não encontrado'
        };
      }

      // Verificar se palavra-chave já existe
      const existingConfig = client.ia_config.find(
        config => config.keyword.toLowerCase() === keyword.toLowerCase()
      );

      if (existingConfig) {
        return {
          success: false,
          error: 'Palavra-chave já existe'
        };
      }

      await client.addIAConfig(keyword, response);
      
      return {
        success: true,
        message: 'Configuração de IA adicionada com sucesso'
      };
      
    } catch (error) {
      console.error('❌ Erro ao adicionar configuração de IA:', error);
      return {
        success: false,
        error: 'Erro interno'
      };
    }
  }

  // Remover configuração de IA
  async removeIAConfig(clientId, configId) {
    try {
      const client = await Client.findOne({ client_id: clientId });
      
      if (!client) {
        return {
          success: false,
          error: 'Cliente não encontrado'
        };
      }

      await client.removeIAConfig(configId);
      
      return {
        success: true,
        message: 'Configuração de IA removida com sucesso'
      };
      
    } catch (error) {
      console.error('❌ Erro ao remover configuração de IA:', error);
      return {
        success: false,
        error: 'Erro interno'
      };
    }
  }
}

module.exports = new IAService();
