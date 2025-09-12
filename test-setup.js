const mongoose = require('mongoose');
const Client = require('./src/models/Client');

// Função para testar a conexão com MongoDB
async function testMongoDB() {
  try {
    console.log('🔗 Testando conexão com MongoDB...');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/saas-ia-whatsapp', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB conectado com sucesso!');
    
    // Testar criação de cliente
    console.log('🧪 Testando criação de cliente...');
    
    const testClient = new Client({
      client_id: 'teste_instalacao',
      name: 'Cliente de Teste',
      phone_number: '5511999999999',
      whatsapp_token: 'token_teste',
      verify_token: 'verify_teste',
      default_response: 'Esta é uma resposta de teste!'
    });
    
    await testClient.save();
    console.log('✅ Cliente de teste criado com sucesso!');
    
    // Testar adição de configuração IA
    console.log('🤖 Testando configuração de IA...');
    
    await testClient.addIAConfig('teste', 'Resposta automática de teste');
    console.log('✅ Configuração de IA adicionada com sucesso!');
    
    // Testar busca de resposta
    console.log('🔍 Testando busca de resposta...');
    
    const response = testClient.findResponse('Esta é uma mensagem de teste');
    console.log('📝 Resposta encontrada:', response);
    
    // Limpar dados de teste
    console.log('🧹 Limpando dados de teste...');
    await Client.deleteOne({ client_id: 'teste_instalacao' });
    console.log('✅ Dados de teste removidos!');
    
    console.log('🎉 Todos os testes passaram! Sistema está funcionando corretamente.');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
    console.error('💡 Verifique se o MongoDB está rodando e configurado corretamente.');
  } finally {
    await mongoose.disconnect();
    console.log('👋 Desconectado do MongoDB.');
  }
}

// Testar sem conectar ao servidor web
if (require.main === module) {
  require('dotenv').config();
  testMongoDB();
}

module.exports = { testMongoDB };
