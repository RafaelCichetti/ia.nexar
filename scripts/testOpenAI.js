const mongoose = require('mongoose');
require('dotenv').config();

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI);

const Client = require('../src/models/Client');
const IAEngine = require('../src/services/IAEngine');

async function testOpenAI() {
  try {
    console.log('🧪 Testando integração com OpenAI...');
    
    // Verificar se a API Key está configurada
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-your-openai-api-key-here') {
      console.log('⚠️  API Key da OpenAI não configurada!');
      console.log('📝 Para testar com a OpenAI real:');
      console.log('   1. Acesse https://platform.openai.com/api-keys');
      console.log('   2. Crie uma API Key');
      console.log('   3. Substitua OPENAI_API_KEY no arquivo .env');
      console.log('');
      console.log('🔧 Executando teste em modo simulação...');
    }
    
    // Buscar um cliente para teste
    const client = await Client.findOne();
    if (!client) {
      console.log('❌ Nenhum cliente encontrado para teste');
      process.exit(1);
    }
    
    console.log(`🏢 Cliente de teste: ${client.name} (${client.client_id})`);
    console.log(`📋 Instruções IA: ${client.ai_instructions.substring(0, 100)}...`);
    console.log('');
    
    const iaEngine = new IAEngine();
    
    // Mensagens de teste
    const testMessages = [
      'Olá! Gostaria de saber sobre os serviços.',
      'Qual é o horário de funcionamento?',
      'Vocês fazem delivery?',
      'Quanto custa?'
    ];
    
    console.log('🧠 Iniciando testes com IA...');
    console.log('='.repeat(60));
    
    for (const [index, message] of testMessages.entries()) {
      console.log(`\n📱 Teste ${index + 1}: "${message}"`);
      console.log('-'.repeat(40));
      
      const startTime = Date.now();
      
      try {
        const response = await iaEngine.gerarResposta(
          message,
          client,
          'test_user_' + (index + 1)
        );
        
        const responseTime = Date.now() - startTime;
        
        if (response.sucesso) {
          console.log(`✅ Resposta (${responseTime}ms):`);
          console.log(`🤖 ${response.resposta}`);
          console.log(`📊 Modelo: ${response.modelo}`);
          console.log(`🔢 Tokens: ${response.tokens_usados}`);
          console.log(`💰 Custo: $${response.custo_estimado}`);
          
          if (response.metadata?.contexto_usado) {
            console.log(`🧠 Contexto utilizado: ${response.metadata.mensagens_contexto} mensagens`);
          }
        } else {
          console.log(`❌ Erro: ${response.erro}`);
        }
        
      } catch (error) {
        console.log(`❌ Erro no teste: ${error.message}`);
      }
      
      // Pausa entre testes
      if (index < testMessages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Testes concluídos!');
    
    // Verificar logs de conversa
    const ConversationLog = require('../src/models/ConversationLog');
    const logs = await ConversationLog.find({ client_id: client.client_id }).limit(5);
    
    if (logs.length > 0) {
      console.log(`\n📊 Últimas ${logs.length} conversas registradas:`);
      logs.forEach((log, index) => {
        console.log(`${index + 1}. ${log.user_message.substring(0, 30)}... -> ${log.success ? '✅' : '❌'} (${log.tokens_used} tokens)`);
      });
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    process.exit(1);
  }
}

testOpenAI();
