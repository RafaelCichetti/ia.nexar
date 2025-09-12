const axios = require('axios');

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const baseURL = process.env.API_URL || 'http://localhost:5010';
  const client_id = Number(process.env.CLIENT_ID || 9);
  const phone = process.env.PHONE || '+5511988887777';
  const messages = (
    process.env.MESSAGES || 
    'Oi, quero agendar manutenção de geladeira Brastemp amanhã às 15h|Consulta|Amanhã às 15h|Confirmar'
  ).split('|');

  for (const message of messages) {
    try {
      const res = await axios.post(`${baseURL}/webhook/test`, { client_id, phone, message });
      const data = res.data?.data || res.data;
      console.log('\n➡️ Enviado:', message);
      console.log('⬅️ Resposta:', data.ai_response || data.response);
    } catch (err) {
      console.error('Erro na mensagem', message, '-', err.response?.data || err.message);
      process.exitCode = 1;
    }
    await sleep(500);
  }
}

if (require.main === module) {
  main();
}
