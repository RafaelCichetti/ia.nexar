require('dotenv').config();
const mongoose = require('mongoose');
const Client = require('./src/models/Client');

async function configurarIACliente() {
  try {
    console.log('🔗 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    // ID do cliente que você quer configurar
    const CLIENT_ID = 'loja_tech_store'; // Altere aqui para o cliente desejado
    
    console.log(`🔧 Configurando IA para cliente: ${CLIENT_ID}`);
    
    // Encontrar o cliente
    const client = await Client.findOne({ client_id: CLIENT_ID });
    
    if (!client) {
      console.log('❌ Cliente não encontrado!');
      process.exit(1);
    }
    
    console.log(`✅ Cliente encontrado: ${client.name}`);
    
    // Configurações personalizadas da IA
    const iaConfig = [
      {
        keyword: 'produto',
        response: `Temos os melhores produtos de tecnologia! 📱💻
        
🔥 Ofertas em destaque:
• Notebooks Dell, HP, Lenovo
• Smartphones iPhone, Samsung, Xiaomi  
• Acessórios: mouse, teclado, fones
• Componentes de PC

💳 Parcelamos em até 12x sem juros
🚚 Entrega rápida em toda região

Qual produto você está procurando?`,
        variations: ['produtos', 'item', 'venda', 'comprar', 'notebook', 'celular', 'smartphone'],
        category: 'product',
        confidence_threshold: 0.6
      },
      {
        keyword: 'preço',
        response: `Nossos preços são super competitivos! 💰

📊 Exemplos de preços:
• Notebooks: R$ 1.500 - R$ 8.000
• Smartphones: R$ 800 - R$ 6.000
• Mouses: R$ 50 - R$ 300
• Teclados: R$ 100 - R$ 500

💳 Formas de pagamento:
• À vista: 5% desconto
• Cartão: até 12x sem juros
• PIX: desconto especial

Sobre qual produto você gostaria de saber o preço?`,
        variations: ['valor', 'custa', 'quanto', 'precos', 'valores'],
        category: 'pricing',
        confidence_threshold: 0.7
      },
      {
        keyword: 'entrega',
        response: `Fazemos entrega sim! 🚚✨

📦 Opções de entrega:
• Entrega expressa: 24h (R$ 15)
• Entrega normal: 2-5 dias úteis (R$ 8)
• Retirada na loja: Grátis

📍 Atendemos toda a região metropolitana
⏰ Entregas de segunda a sábado
📱 Rastreamento pelo WhatsApp

Qual seu CEP para calcular o frete?`,
        variations: ['delivery', 'entregar', 'frete', 'envio', 'transportar'],
        category: 'service',
        confidence_threshold: 0.8
      },
      {
        keyword: 'horário',
        response: `Nosso horário de funcionamento: ⏰

🏪 Loja física:
• Segunda a Sexta: 9h às 18h
• Sábado: 9h às 16h
• Domingo: Fechado

💻 Atendimento online:
• WhatsApp: 24h (resposta automática)
• Chat do site: 9h às 22h
• E-mail: Respondemos em até 2h

📍 Endereço: Rua da Tecnologia, 123 - Centro
Como posso te ajudar?`,
        variations: ['funcionamento', 'aberto', 'fechado', 'atendimento'],
        category: 'info',
        confidence_threshold: 0.5
      },
      {
        keyword: 'garantia',
        response: `Garantia completa em todos produtos! ✅🛡️

🔧 Tipos de garantia:
• Fabricante: 12 meses (mínimo)
• Loja: 90 dias adicionais
• Garantia estendida: até 3 anos

🔄 Troca/Devolução:
• Defeito: 7 dias para troca
• Arrependimento: 7 dias (produto lacrado)
• Produtos usados: não aceitamos

📞 Para acionar:
• WhatsApp: (11) 99999-9999
• E-mail: garantia@lojatechstore.com
• Presencial: traga nota fiscal

Precisa acionar alguma garantia?`,
        variations: ['troca', 'defeito', 'problema', 'conserto', 'assistencia'],
        category: 'support',
        confidence_threshold: 0.7
      }
    ];
    
    // Instruções personalizadas para a IA
    const aiInstructions = `Você é o assistente virtual da Loja Tech Store, especializada em produtos de tecnologia.

PERSONALIDADE:
- Seja sempre simpático, prestativo e profissional
- Use emojis de forma moderada para deixar mais amigável
- Responda de forma clara e objetiva
- Sempre tente direcionar para uma venda ou atendimento humano

INFORMAÇÕES DA LOJA:
- Nome: Loja Tech Store
- Especialidade: Notebooks, smartphones, acessórios de informática
- Horário: Seg-Sex 9h-18h, Sáb 9h-16h
- WhatsApp vendas: (11) 99999-9999
- Email: contato@lojatechstore.com
- Endereço: Rua da Tecnologia, 123 - Centro

DIRETRIZES:
1. Se não souber responder algo específico, direcione para atendimento humano
2. Sempre mencione que temos produtos com qualidade e preços competitivos
3. Ofereça parcelamento e descontos à vista
4. Se perguntarem sobre produtos não vendidos por nós, seja educado mas redirecione para nossos produtos
5. Em dúvidas técnicas complexas, ofereça consultoria gratuita na loja

EXEMPLO DE RESPOSTA:
"Olá! Bem-vindo à Loja Tech Store! 😊 Como posso te ajudar hoje?"`;

    // Atualizar cliente com configurações da IA
    await Client.findByIdAndUpdate(client._id, {
      $set: {
        ia_config: iaConfig,
        ai_instructions: aiInstructions,
        ai_personality: {
          tone: 'friendly_professional',
          business_type: 'tech_store',
          greeting_style: 'enthusiastic',
          response_length: 'detailed'
        },
        ai_features: {
          sentiment_analysis: true,
          context_memory: true,
          entity_extraction: true,
          personalized_responses: true
        }
      }
    });
    
    console.log('✅ Configuração da IA atualizada com sucesso!');
    console.log(`📊 ${iaConfig.length} palavras-chave configuradas`);
    console.log('🤖 Instruções personalizadas definidas');
    
    // Mostrar configurações criadas
    console.log('\n📋 Palavras-chave configuradas:');
    iaConfig.forEach((config, index) => {
      console.log(`${index + 1}. "${config.keyword}" -> ${config.response.substring(0, 50)}...`);
    });
    
    await mongoose.disconnect();
    console.log('👋 Desconectado do MongoDB.');
    
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  console.log('🤖 Configurador de IA para Clientes - SaaS WhatsApp');
  console.log('=' .repeat(50));
  configurarIACliente();
}

module.exports = { configurarIACliente };
