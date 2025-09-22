const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

// GET /api/ai/status
// Parâmetro opcional: ?test=1 para fazer uma chamada simples de validação (custo mínimo)
router.get('/status', async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const configured = !!apiKey && apiKey !== 'sk-your-openai-api-key-here';
    const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

    // Status básico sem network call
    const base = {
      success: true,
      openai_configured: configured,
      model,
    };

    if (!configured) {
      return res.json({ ...base, note: 'OPENAI_API_KEY ausente - motor em modo simulação' });
    }

    // Teste opcional (faz uma requisição real à OpenAI)
    if (String(req.query.test || '').toLowerCase() === '1') {
      try {
        const client = new OpenAI({ apiKey });
        // Chamada mínima para validar credenciais
        const resp = await client.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: 'Você é um verificador de status.' },
            { role: 'user', content: 'ping' },
          ],
          max_tokens: 4,
          temperature: 0,
        });
        return res.json({ ...base, live_test: 'ok', usage_model: resp.model || model });
      } catch (e) {
        return res.status(502).json({
          ...base,
          live_test: 'fail',
          error: e?.response?.data || e?.message || String(e),
        });
      }
    }

    return res.json(base);
  } catch (error) {
    console.error('❌ Erro no status da OpenAI:', error);
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
});

module.exports = router;
