const axios = require('axios');

async function testarIAConversacional() {
  console.log('� Testando IA Conversacional Avançada...');
  
  const tests = [
    {
      name: 'Saudação Natural',
      message: 'Oi! Tudo bem? Como vocês estão?'
    },
    {
      name: 'Pergunta sobre Cardápio (Variação)',
      message: 'Que tipo de comida vocês têm aí?'
    },
    {
      name: 'Consulta com Sentimento Positivo',
      message: 'Adorei o atendimento! Posso agendar uma consulta?'
    },
    {
      name: 'Reclamação com Sentimento Negativo',
      message: 'Estou muito chateado com o produto que comprei'
    },
    {
      name: 'Pergunta Complexa com Entidades',
      message: 'Meu celular Samsung quebrou, vocês cobrem garantia? Meu telefone é (11) 99999-9999'
    },
    {
      name: 'Conversa Contextual',
      message: 'E sobre o preço, pode me dar desconto?'
    },
    {
      name: 'Mensagem Sem Correspondência',
      message: 'Qual a cor do cavalo branco de Napoleão?'
    }
  ];

  // Simular mensagem base do WhatsApp
  const mensagemBase = {
    object: "whatsapp_business_account",
    entry: [{
      id: "123456789",
      changes: [{
        value: {
          messaging_product: "whatsapp",
          metadata: {
            display_phone_number: "15551234567",
            phone_number_id: "clinica_dr_silva"
          },
          messages: [{
            from: "5511999999999",
            id: "wamid.example123",
            timestamp: Date.now().toString(),
            text: { body: "" },
            type: "text"
          }]
        },
        field: "messages"
      }]
    }]
  };

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    console.log(`\n🧪 Teste ${i + 1}: ${test.name}`);
    console.log(`📝 Mensagem: "${test.message}"`);
    
    const mensagem = { ...mensagemBase };
    mensagem.entry[0].changes[0].value.messages[0].text.body = test.message;
    mensagem.entry[0].changes[0].value.messages[0].id = `wamid.test${i + 1}`;

    try {
      const response = await axios.post('http://localhost:3000/webhook', mensagem, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log(`✅ Status: ${response.status}`);
      
      // Aguardar um pouco entre os testes para simular conversa real
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Erro no teste ${i + 1}:`, error.response?.data || error.message);
    }
  }

  console.log('\n🎉 Testes de IA Conversacional concluídos!');
  console.log('📊 Verifique os logs do servidor para ver as respostas detalhadas da IA.');
}

testarIAConversacional();
