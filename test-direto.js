require('dotenv').config();
const IAEngine = require('./src/services/IAEngine');

console.log('=== TESTE DIRETO IAEngine ===');
const iaEngine = new IAEngine();

async function testeDirecto() {
  try {
    console.log('Testando gerarResposta...');
    const result = await iaEngine.gerarResposta(
      'teste direto',
      { 
        client_id: 'teste',
        name: 'Empresa Teste',
        ai_assistant_name: 'Assistente Teste',
        ai_instructions: 'Você é um assistente de teste'
      },
      'teste_phone'
    );
    console.log('Resultado:', result);
  } catch (error) {
    console.error('Erro:', error);
  }
}

testeDirecto();
