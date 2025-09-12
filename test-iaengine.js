// Teste simples do IAEngine
console.log('Iniciando teste do IAEngine...');

try {
  const IAEngine = require('./src/services/IAEngine');
  console.log('✅ IAEngine carregado com sucesso');
  console.log('Tipo:', typeof IAEngine);
  console.log('É função?', typeof IAEngine === 'function');
  
  if (typeof IAEngine === 'function') {
    const engine = new IAEngine();
    console.log('✅ Instância criada com sucesso');
  } else {
    console.log('❌ IAEngine não é um construtor');
    console.log('Propriedades:', Object.getOwnPropertyNames(IAEngine));
  }
} catch (error) {
  console.error('❌ Erro ao carregar IAEngine:', error);
}
