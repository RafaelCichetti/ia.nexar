const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();



const webhookRoutes = require('./src/routes/webhook');
const clientRoutes = require('./src/routes/client');
const whatsappRoutes = require('./src/routes/whatsapp');
const authRoutes = require('./src/routes/auth');
const compromissoRoutes = require('./src/routes/compromisso');
const publicRoutes = require('./src/routes/public');
const aiRoutes = require('./src/routes/ai');


const app = express();
const BASE_PORT = parseInt(process.env.PORT, 10) || 5000;
let PORT = BASE_PORT;

// Validação mínima de ambiente (evita crash em DEV quando JWT_SECRET ausente)
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'dev-temporary-jwt-secret-change-in-production';
  console.warn('⚠️  JWT_SECRET não definido. Usando fallback inseguro (apenas DEV). Defina JWT_SECRET em produção!');
}

// Middlewares
app.use(helmet());
app.use(morgan('combined'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos da pasta public
app.use(express.static('public'));

// Conectar ao MongoDB
mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/saas-ia-whatsapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Conectado ao MongoDB'))
.catch(err => console.error('❌ Erro ao conectar ao MongoDB:', err));

// Rotas



app.use('/webhook', webhookRoutes);
app.use('/client', clientRoutes);
app.use('/whatsapp', whatsappRoutes);
app.use('/api/auth', authRoutes); // garante prefixo correto
app.use('/compromisso', compromissoRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/ai', aiRoutes);


// Rota de teste para debugging
app.post('/test-webhook', async (req, res) => {
  try {
    console.log('🧪 TESTE: Simulando webhook...', req.body);
    const { client_id, phone_number, message } = req.body;
    
    // Buscar dados do cliente
    const Client = require('./src/models/Client');
    const client = await Client.findOne({ client_id });
    
    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    // Usar o IAEngine para gerar resposta
    const IAEngine = require('./src/services/IAEngineNovo');
    const iaEngine = new IAEngine();
    
    const resultado = await iaEngine.gerarResposta(message, client, phone_number);
    
    res.json({
      success: true,
      client_data: {
        name: client.name,
        ai_assistant_name: client.ai_assistant_name,
        has_custom_instructions: !!client.ai_instructions
      },
      ia_response: resultado
    });
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota de teste
app.get('/', (req, res) => {
  res.json({
    message: '🤖 SaaS IA WhatsApp API está funcionando!',
    version: '1.0.0',
    endpoints: {
      webhook: '/webhook',
      client: '/client/:id'
    }
  });
});

// Healthcheck simples para monitoramento / load balancer
app.get('/health', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState; // 1 conectado
    const estados = { 0: 'desconectado', 1: 'conectado', 2: 'conectando', 3: 'desconectando' };
    res.status(dbState === 1 ? 200 : 500).json({
      status: 'ok',
      uptime_seconds: process.uptime(),
      db_state: estados[dbState] || dbState,
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    res.status(500).json({ status: 'erro', erro: e.message });
  }
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Algo deu errado!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno do servidor'
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    message: `A rota ${req.originalUrl} não existe`
  });
});

function startServer(attempt = 0) {
  const server = app.listen(PORT, () => {
    if (attempt > 0) {
      console.log(`⚠️ Porta base ${BASE_PORT} ocupada. Usando porta alternativa ${PORT}.`);
    }
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📱 Webhook disponível em: http://localhost:${PORT}/webhook`);
    console.log(`⚙️ API do cliente em: http://localhost:${PORT}/client`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      if (attempt < 5) {
        console.warn(`⚠️ Porta ${PORT} em uso. Tentando próxima porta...`);
        PORT = BASE_PORT + attempt + 1;
        setTimeout(() => startServer(attempt + 1), 200);
      } else {
        console.error('❌ Não foi possível encontrar uma porta livre após várias tentativas.');
        process.exit(1);
      }
    } else {
      console.error('❌ Erro ao iniciar servidor:', err);
      process.exit(1);
    }
  });
}

startServer();

module.exports = app;
