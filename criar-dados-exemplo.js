const mongoose = require('mongoose');
const Client = require('./src/models/Client');
require('dotenv').config();

async function criarDadosDeExemplo() {
  try {
    console.log('🔗 Conectando ao MongoDB...');
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/saas-ia-whatsapp');
    
    // Limpar dados existentes
    await Client.deleteMany({});
    
    // Criar clientes de exemplo
    const clientesExemplo = [
      {
        name: 'Clínica Dr. Silva',
        phone_number: '+5511988776655',
        endereco: 'Av. Paulista',
        numero: '2000',
        complemento: 'Conj. 101',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01310-200',
        whatsapp_token: 'EXEMPLO_TOKEN_2',
        verify_token: 'VERIFY_TOKEN_2',
        is_active: true,
        ia_config: [
          {
            keyword: 'consulta',
            response: 'Para agendar sua consulta:\n\n📞 Ligue: (11) 3333-4444\n💻 Site: www.clinicasilva.com.br\n📱 WhatsApp: clique aqui para falar com nossa recepção\n\nEspecialidades disponíveis:\n👨‍⚕️ Clínica Geral\n❤️ Cardiologia\n🦴 Ortopedia',
            variations: ['agendamento', 'agendar', 'marcar', 'horario', 'consultar'],
            category: 'service',
            confidence_threshold: 0.7
          },
          {
            keyword: 'exame',
            response: 'Para resultados de exames:\n\n🔍 Consulte online: www.clinicasilva.com.br/resultados\n📧 Email: resultados@clinicasilva.com.br\n📞 Central: (11) 3333-4444\n\n⚠️ Lembre-se de ter em mãos seu CPF e data de nascimento.',
            variations: ['resultado', 'laboratorio', 'sangue', 'teste', 'analise'],
            category: 'support',
            confidence_threshold: 0.6
          }
        ],
        ai_personality: {
          tone: 'professional',
          business_type: 'clinic',
          greeting_style: 'professional',
          response_length: 'detailed'
        },
        ai_features: {
          sentiment_analysis: true,
          context_memory: true,
          entity_extraction: true,
          personalized_responses: true
        },
        stats: {
          messages_received: 23,
          messages_sent: 23,
          response_rate: 100,
          last_activity: new Date()
        }
      },
      {
        name: 'Loja Tech Store',
        phone_number: '+5511977665544',
        endereco: 'Rua do Comércio',
        numero: '500',
        complemento: 'Sala 12',
        bairro: 'Centro',
        cidade: 'Campinas',
        estado: 'SP',
        cep: '13010-000',
        whatsapp_token: 'EXEMPLO_TOKEN_3',
        verify_token: 'VERIFY_TOKEN_3',
        is_active: true,
        ia_config: [
          {
            keyword: 'produto',
            response: 'Temos os melhores smartphones! 📱\n\n🔥 Ofertas da semana:\n• iPhone 15 Pro - R$ 7.999\n• Samsung Galaxy S24 - R$ 4.499\n• Xiaomi 13 - R$ 2.299\n\n💳 Parcelamos em até 12x sem juros\n🚚 Frete grátis para todo Brasil',
            variations: ['celular', 'smartphone', 'iphone', 'samsung', 'oferta', 'preco'],
            category: 'product',
            confidence_threshold: 0.6
          },
          {
            keyword: 'garantia',
            response: 'Garantia Tech Store:\n\n✅ 12 meses de garantia\n✅ Troca em até 7 dias\n✅ Suporte técnico gratuito\n\nPara acioná-la:\n📧 garantia@techstore.com.br\n📞 0800-123-4567\n\nPrecisa do número da nota fiscal! 🧾',
            variations: ['troca', 'defeito', 'problema', 'assistencia', 'suporte'],
            category: 'support',
            confidence_threshold: 0.7
          }
        ],
        ai_personality: {
          tone: 'casual',
          business_type: 'store',
          greeting_style: 'enthusiastic',
          response_length: 'medium'
        },
        ai_features: {
          sentiment_analysis: true,
          context_memory: true,
          entity_extraction: true,
          personalized_responses: true
        },
        stats: {
          messages_received: 67,
          messages_sent: 61,
          response_rate: 91.0,
          last_activity: new Date()
        }
      }
    ];

    console.log('👥 Criando clientes de exemplo...');
    await Client.insertMany(clientesExemplo);
    
    console.log('✅ Dados de exemplo criados com sucesso!');
    console.log(`📊 ${clientesExemplo.length} clientes criados`);
    
    await mongoose.disconnect();
    console.log('👋 Desconectado do MongoDB.');
    
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

criarDadosDeExemplo();
