// Script para criar usuário admin direto no MongoDB
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
require('dotenv').config();

async function criarUsuario() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/saas-ia-whatsapp');
  const email = 'comecial@nexar.com.br';
  const senha = 'qwe123!@#';
  const jaExiste = await User.findOne({ email });
  if (jaExiste) {
    console.log('Usuário já existe:', email);
    process.exit(0);
  }

  const user = new User({
    nome: 'Comercial Nexar',
    email,
    senha, // texto puro, o model faz o hash
    tipo: 'admin',
    client_id: null
  });
  await user.save();
  console.log('Usuário admin criado com sucesso:', email);
  process.exit(0);
}

criarUsuario();
