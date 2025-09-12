// Script para remover clientes sem client_id do banco de dados MongoDB
// Salve este arquivo como scripts/limpar-clientes-sem-id.js e execute com: node scripts/limpar-clientes-sem-id.js

const mongoose = require('mongoose');
const Client = require('../src/models/Client');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nexar';

async function main() {
  await mongoose.connect(MONGO_URI);
  const result = await Client.deleteMany({});
  console.log(`Todos os clientes removidos: ${result.deletedCount}`);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Erro ao limpar clientes:', err);
  process.exit(1);
});
