const mongoose = require('mongoose');
require('dotenv').config();

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI);

const Client = require('../src/models/Client');

async function updateClientData() {
  try {
    console.log('🔄 Atualizando dados dos clientes para IA OpenAI...');
    
    // Verificar se existem clientes
    const existingClients = await Client.find();
    console.log(`📊 ${existingClients.length} clientes encontrados`);
    
    if (existingClients.length === 0) {
      console.log('🆕 Criando cliente de exemplo...');
      
      // Criar cliente de exemplo com dados completos para IA
      const exampleClient = new Client({
        client_id: 'EMP001',
        name: 'Restaurante Sabor & Arte',
        email: 'contato@saborarte.com.br',
        phone: '+5511999887766',
        whatsapp_token: 'WHATSAPP_TOKEN_EXEMPLO',
        whatsapp_number: '+5511999887766',
        business_info: `
Restaurante Sabor & Arte é um estabelecimento gastronômico familiar localizado no centro de São Paulo.
Especialidades: culinária brasileira contemporânea, pratos vegetarianos e veganos.
Horário de funcionamento: terça a domingo, 11h30 às 23h.
Delivery: disponível via WhatsApp e aplicativos.
Faixa de preço: R$ 25-80 por pessoa.
Ambiente: aconchegante, ideal para casais e famílias.
Reservas: recomendadas para finais de semana.
`.trim(),
        ai_instructions: `
Você é o assistente virtual do Restaurante Sabor & Arte. Seja sempre cordial, acolhedor e prestativo.
- Responda dúvidas sobre cardápio, preços, horários e reservas
- Promova nossos pratos especiais e promoções quando apropriado
- Para pedidos de delivery, colete: nome, endereço completo, telefone e preferência de pagamento
- Para reservas, colete: nome, data, horário, número de pessoas e telefone
- Seja natural e conversacional, evite respostas robotizadas
- Se não souber algo específico, ofereça contato direto com a equipe
- Mantenha o tom amigável e profissional sempre
`.trim(),
        ai_personality: {
          tone: 'amigável',
          style: 'conversational',
          language: 'português brasileiro',
          context_memory: true,
          proactive_suggestions: true
        },
        ai_features: {
          sentiment_analysis: true,
          context_memory: true,
          personalization: true,
          multilingual: false
        },
        keywords: [
          { keyword: 'cardápio', response: 'Vou te ajudar com informações sobre nosso cardápio!' },
          { keyword: 'preço', response: 'Posso te informar sobre nossos preços!' },
          { keyword: 'delivery', response: 'Fazemos delivery! Vou te ajudar com o pedido.' },
          { keyword: 'reserva', response: 'Vou te ajudar a fazer uma reserva!' }
        ],
        default_response: 'Olá! Bem-vindo ao Restaurante Sabor & Arte! Como posso te ajudar hoje?',
        stats: {
          total_messages: 0,
          ai_responses: 0,
          tokens_used: 0,
          last_cost_usd: 0,
          created_at: new Date(),
          last_activity: new Date()
        }
      });
      
      await exampleClient.save();
      console.log('✅ Cliente de exemplo criado:', exampleClient.name);
    } else {
      // Atualizar clientes existentes
      for (const client of existingClients) {
        console.log(`🔄 Atualizando cliente: ${client.name}`);
        
        const updates = {
          business_info: client.business_info || `
${client.name} é uma empresa que utiliza IA conversacional para atendimento via WhatsApp.
Oferecemos atendimento personalizado e eficiente para nossos clientes.
Horário de atendimento: segunda a sexta, 8h às 18h.
Entre em contato para mais informações sobre nossos produtos e serviços.
`.trim(),
          ai_instructions: client.ai_instructions || `
Você é o assistente virtual da ${client.name}. Seja sempre cordial e prestativo.
- Responda dúvidas sobre produtos, serviços e horários
- Mantenha um tom profissional mas amigável
- Colete informações necessárias de forma natural
- Se não souber algo específico, ofereça contato direto com a equipe
- Seja conversacional e evite respostas robotizadas
`.trim(),
          ai_personality: {
            tone: 'profissional',
            style: 'conversational',
            language: 'português brasileiro',
            context_memory: true,
            proactive_suggestions: true,
            ...client.ai_personality
          },
          ai_features: {
            sentiment_analysis: true,
            context_memory: true,
            personalization: true,
            multilingual: false,
            ...client.ai_features
          }
        };
        
        // Adicionar estatísticas se não existirem
        if (!client.stats) {
          updates.stats = {
            total_messages: 0,
            ai_responses: 0,
            tokens_used: 0,
            last_cost_usd: 0,
            created_at: client.created_at || new Date(),
            last_activity: new Date()
          };
        }
        
        await Client.findByIdAndUpdate(client._id, updates);
        console.log(`✅ Cliente atualizado: ${client.name}`);
      }
    }
    
    // Exibir clientes atualizados
    const updatedClients = await Client.find();
    console.log('\n📋 Clientes configurados para IA OpenAI:');
    updatedClients.forEach(client => {
      console.log(`- ${client.name} (${client.client_id})`);
      console.log(`  📞 WhatsApp: ${client.whatsapp_number}`);
      console.log(`  🧠 Instruções IA: ${client.ai_instructions.substring(0, 100)}...`);
      console.log(`  📈 Personalidade: ${client.ai_personality.tone}, ${client.ai_personality.style}`);
      console.log('');
    });
    
    console.log('🎉 Atualização concluída com sucesso!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erro ao atualizar dados:', error);
    process.exit(1);
  }
}

updateClientData();
