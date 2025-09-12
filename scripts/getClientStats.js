const axios = require('axios');

async function main() {
  const baseURL = process.env.API_URL || 'http://localhost:5010';
  const client_id = Number(process.env.CLIENT_ID || 9);
  try {
    const res = await axios.get(`${baseURL}/client/${client_id}/stats`);
    const data = res.data?.data || res.data;
    console.log('Resumo stats:', {
      total_conversations: data.statistics?.total_conversations,
      monthly_conversations: data.statistics?.monthly_conversations,
      unique_users: data.statistics?.unique_users
    });
    console.log('Daily stats (últimos 3):', (data.daily_stats || []).slice(-3));
  } catch (err) {
    console.error('Erro ao buscar stats:', err.response?.data || err.message);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}
