
const express = require('express');
const router = express.Router();
const Compromisso = require('../models/Compromisso');
const AgendaIA = require('../services/AgendaIA');

// POST /compromisso/agendar-automatico
router.post('/agendar-automatico', async (req, res) => {
  try {
    const { client_id, nome_cliente, procedimento, descricao, preferenciaData } = req.body;
    const compromisso = await AgendaIA.agendarAutomatico({
      client_id,
      nome_cliente,
      procedimento,
      descricao,
      preferenciaData: preferenciaData ? new Date(preferenciaData) : new Date()
    });
    if (!compromisso) {
      return res.status(400).json({ success: false, error: 'Nenhum horário disponível nos próximos dias.' });
    }
    res.json({ success: true, data: compromisso });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Erro ao agendar automaticamente.' });
  }
});

// Listar compromissos de um cliente
router.get('/:client_id', async (req, res) => {
  try {
    const compromissos = await Compromisso.find({ client_id: req.params.client_id });
    res.json({ success: true, data: compromissos });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Erro ao buscar compromissos' });
  }
});

// Criar novo compromisso
router.post('/', async (req, res) => {
  try {
    console.log('🔎 [POST /compromisso] Body recebido:', req.body);
    const compromisso = await Compromisso.create(req.body);
    res.json({ success: true, data: compromisso });
  } catch (err) {
    console.error('❌ Erro ao criar compromisso:', err);
    res.status(400).json({ success: false, error: 'Erro ao criar compromisso', details: err.message });
  }
});

// Atualizar compromisso
router.put('/:id', async (req, res) => {
  try {
    const compromisso = await Compromisso.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!compromisso) return res.status(404).json({ success: false, error: 'Compromisso não encontrado' });
    res.json({ success: true, data: compromisso });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Erro ao atualizar compromisso' });
  }
});

// Deletar compromisso
router.delete('/:id', async (req, res) => {
  try {
    const compromisso = await Compromisso.findByIdAndDelete(req.params.id);
    if (!compromisso) return res.status(404).json({ success: false, error: 'Compromisso não encontrado' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Erro ao deletar compromisso' });
  }
});

// Buscar horários disponíveis para agendamento automático
router.get('/:client_id/disponibilidade', async (req, res) => {
  try {
    const { data_inicio, data_fim } = req.query;
    const compromissos = await Compromisso.find({
      client_id: req.params.client_id,
      data_inicio: { $gte: new Date(data_inicio) },
      data_fim: { $lte: new Date(data_fim) }
    });
    res.json({ success: true, data: compromissos });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Erro ao buscar disponibilidade' });
  }
});

module.exports = router;
