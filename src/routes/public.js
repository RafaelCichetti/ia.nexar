const express = require('express');
const router = express.Router();
const { sendLandingContactEmail } = require('../services/emailService');

router.post('/landing/contact', async (req, res) => {
  try {
    const { nome, empresa, ramo, problema } = req.body || {};
    if (!nome || !empresa || !ramo || !problema) {
      return res.status(400).json({ success: false, error: 'Campos obrigatórios: nome, empresa, ramo, problema' });
    }
    await sendLandingContactEmail({ nome, empresa, ramo, problema });
    return res.json({ success: true });
  } catch (e) {
    console.error('Erro ao enviar contato da landing:', e);
    return res.status(500).json({ success: false, error: 'Falha ao enviar, tente novamente.' });
  }
});

module.exports = router;
