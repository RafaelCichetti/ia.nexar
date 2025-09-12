const express = require('express');
const router = express.Router();
const googleCalendarService = require('../services/googleCalendarService');
const Client = require('../models/Client');


// 1. Iniciar OAuth (gera URL de autorização por cliente)
router.get('/auth-url/:clientId', async (req, res) => {
  const client = await Client.findOne({ client_id: req.params.clientId });
  if (!client || !client.google_oauth || !client.google_oauth.client_id) {
    return res.status(400).json({ error: 'Credenciais Google não configuradas para este cliente.' });
  }
  const url = googleCalendarService.getAuthUrl(client.google_oauth);
  res.json({ url });
});


// 2. Callback OAuth (salva tokens no cadastro do cliente)
router.get('/oauth2callback', async (req, res) => {
  const { code, state } = req.query;
  const clientId = state;
  try {
    const client = await Client.findOne({ client_id: clientId });
    if (!client || !client.google_oauth || !client.google_oauth.client_id) {
      return res.status(400).send('Credenciais Google não configuradas para este cliente.');
    }
    const { tokens } = await googleCalendarService.getToken(client.google_oauth, code);
    await Client.findOneAndUpdate(
      { client_id: clientId },
      { $set: { google_calendar_tokens: tokens } }
    );
    res.send('<h2>Google Agenda vinculada com sucesso! Você pode fechar esta janela.</h2>');
  } catch (err) {
    res.status(500).send('Erro ao vincular Google Agenda.');
  }
});


// 3. Buscar eventos da agenda do cliente
router.get('/events/:clientId', async (req, res) => {
  const client = await Client.findOne({ client_id: req.params.clientId });
  if (!client || !client.google_calendar_tokens || !client.google_oauth || !client.google_oauth.client_id) {
    return res.status(404).json({ success: false, error: 'Agenda não vinculada ou credenciais ausentes' });
  }
  try {
    const events = await googleCalendarService.getEvents(client.google_calendar_tokens, client.google_oauth);
    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Erro ao buscar eventos' });
  }
});


// 4. Criar evento na agenda do cliente
router.post('/events/:clientId', async (req, res) => {
  const client = await Client.findOne({ client_id: req.params.clientId });
  if (!client || !client.google_calendar_tokens || !client.google_oauth || !client.google_oauth.client_id) {
    return res.status(404).json({ success: false, error: 'Agenda não vinculada ou credenciais ausentes' });
  }
  try {
    const event = req.body;
    const created = await googleCalendarService.createEvent(client.google_calendar_tokens, client.google_oauth, event);
    res.json({ success: true, event: created });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Erro ao criar evento' });
  }
});

// Arquivo removido: Rotas Google Calendar desativadas
