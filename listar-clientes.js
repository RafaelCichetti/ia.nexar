// Script para listar todos os clientes do banco de dados MongoDB
const mongoose = require('mongoose');
const Client = require('./src/models/Client');
require('dotenv').config();

async function listarClientes() {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/saas-ia-whatsapp');
    const clientes = await Client.find({}, { _id: 1, client_id: 1, name: 1 });
    console.log('Clientes encontrados:');
    clientes.forEach(c => {
      console.log(`_id: ${c._id} | client_id: ${c.client_id} | name: ${c.name}`);
    });
    await mongoose.disconnect();
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    process.exit(1);
  }
}

listarClientes();
