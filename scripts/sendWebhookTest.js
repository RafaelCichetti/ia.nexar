const axios = require('axios');

async function main() {
  const baseURL = process.env.API_URL || 'http://localhost:5010';
  const client_id = Number(process.env.CLIENT_ID || 9);
  const phone = process.env.PHONE || '+5511988887777';
  const message = process.env.MESSAGE || 'Oi, quero agendar manutenção de geladeira Brastemp amanhã às 15h';

  try {
    const res = await axios.post(`${baseURL}/webhook/test`, { client_id, phone, message });
    console.log('Resposta do teste webhook:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('Erro ao chamar /webhook/test:', err.response?.data || err.message);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}
