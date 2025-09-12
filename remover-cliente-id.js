// Script para remover um cliente específico pelo _id
const mongoose = require('mongoose');
const Client = require('./src/models/Client');
require('dotenv').config();

async function removerClientePorId() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const result = await Client.deleteOne({ _id: '6893d37b2d12c4f5f53767ec' });
    console.log('Remoção:', result);
    await mongoose.disconnect();
  } catch (error) {
    console.error('Erro ao remover cliente:', error);
    process.exit(1);
  }
}

removerClientePorId();
