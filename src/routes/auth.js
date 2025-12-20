const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendResetPinEmail } = require('../services/emailService');
const router = express.Router();

// Lazy getters para garantir carga dos models somente após conexão
const getUserModel = () => require('../models/User');
const getClientModel = () => require('../models/Client');
const getPasswordResetTokenModel = () => require('../models/PasswordResetToken');
const getPasswordResetPinModel = () => require('../models/PasswordResetPin');

// Middleware para proteger rotas
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, error: 'Token não fornecido' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Token inválido' });
  }
}

// Login
router.post('/login', async (req, res) => {
  try {
    const User = getUserModel();
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ success: false, error: 'Email e senha são obrigatórios' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Credenciais inválidas' });
    }
    const ok = await user.comparePassword(senha);
    if (!ok) {
      return res.status(401).json({ success: false, error: 'Credenciais inválidas' });
    }
    const token = jwt.sign({ id: user._id, tipo: user.tipo, client_id: user.client_id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ success: true, data: { token, user: { nome: user.nome, email: user.email, tipo: user.tipo, client_id: user.client_id } } });
  } catch (e) {
    console.error('Erro na rota /api/auth/login:', e?.message || e);
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
});

// Cadastro de usuário (apenas admin)
router.post('/register', auth, async (req, res) => {
  if (req.user.tipo !== 'admin') return res.status(403).json({ success: false, error: 'Acesso negado' });
  const { nome, email, senha, tipo, client_id } = req.body;
  if (tipo === 'cliente' && !client_id) return res.status(400).json({ success: false, error: 'client_id obrigatório para usuário cliente' });
  try {
    const User = getUserModel();
    const user = await User.create({ nome, email, senha, tipo, client_id: tipo === 'cliente' ? client_id : null });
    res.json({ success: true, data: { id: user._id, nome: user.nome, email: user.email, tipo: user.tipo, client_id: user.client_id } });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Dados do usuário logado
router.get('/me', auth, async (req, res) => {
  try {
    const User = getUserModel();
    const user = await User.findById(req.user.id).select('-senha');
    if (!user) return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
    res.json({ success: true, data: user });
  } catch (e) {
    console.error('Erro na rota /api/auth/me:', e?.message || e);
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
});

// Listar administradores (apenas admin)
router.get('/admins', auth, async (req, res) => {
  if (req.user.tipo !== 'admin') return res.status(403).json({ success: false, error: 'Acesso negado' });
  try {
    const User = getUserModel();
    const admins = await User.find({ tipo: 'admin' }).select('nome email created_at');
    res.json({ success: true, data: admins });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Erro ao listar administradores' });
  }
});


// Alterar senha do usuário autenticado
router.post('/change-password', auth, async (req, res) => {
  const { senha_atual, nova_senha } = req.body;
  if (!senha_atual || !nova_senha) {
    return res.status(400).json({ success: false, error: 'Informe a senha atual e a nova senha' });
  }
  try {
    const User = getUserModel();
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
    const senhaCorreta = await user.comparePassword(senha_atual);
    if (!senhaCorreta) {
      return res.status(401).json({ success: false, error: 'Senha atual incorreta' });
    }
    user.senha = nova_senha;
    await user.save();
    res.json({ success: true, message: 'Senha alterada com sucesso' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Erro ao alterar senha' });
  }
});

// Solicitar reset de senha (gera PIN de 8 dígitos e envia e-mail)
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: 'Email obrigatório' });
  const User = getUserModel();
  const user = await User.findOne({ email });
  // Sempre resposta genérica para não vazar existência de usuário
  if (!user) return res.json({ success: true, message: 'Se existir usuário enviaremos o e-mail' });

  // Invalida PINs anteriores
  const PasswordResetPin = getPasswordResetPinModel();
  await PasswordResetPin.deleteMany({ user_id: user._id });

  // Gera PIN de 8 dígitos
  const pin = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join('');
  const expires = new Date(Date.now() + 1000 * 60 * 15); // 15 minutos
  await PasswordResetPin.create({ user_id: user._id, pin, expires_at: expires });

  try {
    await sendResetPinEmail(email, pin);
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Falha ao enviar e-mail de reset' });
  }

  res.json({ success: true, message: 'Se existir usuário enviaremos o e-mail' });
});

// Verificar PIN
router.post('/verify-reset-pin', async (req, res) => {
  const { email, pin } = req.body;
  if (!email || !pin) return res.status(400).json({ success: false, error: 'Email e PIN obrigatórios' });
  const User = getUserModel();
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ success: false, error: 'PIN inválido' });
  const PasswordResetPin = getPasswordResetPinModel();
  const doc = await PasswordResetPin.findOne({ user_id: user._id, pin, used: false });
  if (!doc) return res.status(400).json({ success: false, error: 'PIN inválido' });
  if (doc.expires_at < new Date()) return res.status(400).json({ success: false, error: 'PIN expirado' });
  // marca como usado e gera token único de uma vez para usar no reset
  doc.used = true;
  await doc.save();
  const token = crypto.randomBytes(32).toString('hex');
  const tExp = new Date(Date.now() + 1000 * 60 * 30); // 30 minutos
  const PasswordResetToken = getPasswordResetTokenModel();
  await PasswordResetToken.deleteMany({ user_id: user._id });
  await PasswordResetToken.create({ user_id: user._id, token, expires_at: tExp });
  return res.json({ success: true, data: { token } });
});

// Redefinir senha (com token gerado após validação do PIN)
router.post('/reset-password', async (req, res) => {
  const { token, nova_senha } = req.body;
  if (!token || !nova_senha) return res.status(400).json({ success: false, error: 'Token e nova_senha obrigatórios' });
  const PasswordResetToken = getPasswordResetTokenModel();
  const doc = await PasswordResetToken.findOne({ token, used: false });
  if (!doc) return res.status(400).json({ success: false, error: 'Token inválido' });
  if (doc.expires_at < new Date()) return res.status(400).json({ success: false, error: 'Token expirado' });
  const User = getUserModel();
  const user = await User.findById(doc.user_id);
  if (!user) return res.status(400).json({ success: false, error: 'Usuário não encontrado' });
  user.senha = nova_senha;
  await user.save();
  doc.used = true;
  await doc.save();
  res.json({ success: true, message: 'Senha redefinida com sucesso' });
});

module.exports = router;
module.exports.auth = auth;
