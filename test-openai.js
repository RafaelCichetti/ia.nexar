require('dotenv').config();
const OpenAI = require('openai');

console.log('🔍 Testando conexão direta com OpenAI...');
console.log('🔑 API Key existe:', !!process.env.OPENAI_API_KEY);
console.log('🔑 API Key válida (não é placeholder):', process.env.OPENAI_API_KEY !== 'sk-your-openai-api-key-here');
console.log('🔑 Primeiros/últimos caracteres da API Key:', process.env.OPENAI_API_KEY?.substring(0, 10) + '...' + process.env.OPENAI_API_KEY?.substring(-10));

try {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  console.log('✅ Cliente OpenAI inicializado com sucesso');

  // Teste simples da API
  (async () => {
    try {
      console.log('🚀 Fazendo chamada de teste para a API...');
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'user', content: 'Diga apenas "OK" se você está funcionando' }
        ],
        max_tokens: 10
      });

      console.log('✅ Resposta da API:', response.choices[0].message.content);
      console.log('📊 Tokens usados:', response.usage.total_tokens);
    } catch (apiError) {
      console.error('❌ Erro na chamada da API:', apiError.message);
      console.error('📋 Detalhes do erro:', apiError);
    }
  })();

} catch (initError) {
  console.error('❌ Erro ao inicializar cliente OpenAI:', initError.message);
  console.error('📋 Detalhes do erro:', initError);
}
