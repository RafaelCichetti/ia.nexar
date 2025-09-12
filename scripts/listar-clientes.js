// Script para listar todos os clientes do banco de dados MongoDB
// Salve como scripts/listar-clientes.js e execute com: node scripts/listar-clientes.js

const mongoose = require('mongoose');
const Client = require('../src/models/Client');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nexar';

async function main() {
  await mongoose.connect(MONGO_URI);
  const clientes = await Client.find({}, { _id: 1, client_id: 1, name: 1 });
  console.log('Clientes encontrados:');
  clientes.forEach(c => {
    console.log(`_id: ${c._id} | client_id: ${c.client_id} | name: ${c.name}`);
  });
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Erro ao listar clientes:', err);
  process.exit(1);
});
