const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  nome: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  senha: { type: String, required: true },
  tipo: { type: String, enum: ['admin', 'cliente'], required: true },
  client_id: { type: Number, default: null }, // Só para tipo 'cliente'
  created_at: { type: Date, default: Date.now }
}, {
  collection: 'users',
  bufferCommands: false
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('senha')) return next();
  this.senha = await bcrypt.hash(this.senha, 10);
  next();
});

UserSchema.methods.comparePassword = function(senha) {
  return bcrypt.compare(senha, this.senha);
};

module.exports = mongoose.model('User', UserSchema);
