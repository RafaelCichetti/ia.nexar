const express = require('express');
const path = require('path');

// IMPORTANT: garante uso de UMA única instância de mongoose.
// Se existir mongoose em server/node_modules e também em root/node_modules,
// os models em ../src tendem a resolver o mongoose do root, enquanto este arquivo
// (por estar em /server) pode resolver o mongoose do /server — causando o erro:
// "Cannot call users.findOne() before initial connection is complete" mesmo após connect.
let mongoose;
try {
	mongoose = require(path.join(__dirname, '..', 'node_modules', 'mongoose'));
} catch {
	mongoose = require('mongoose');
}
// Desativa buffering de comandos para evitar timeouts enquanto a conexão não está pronta
mongoose.set('bufferCommands', false);
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const BASE_PORT = parseInt(process.env.PORT, 10) || 5000;
let PORT = BASE_PORT;
let initialized = false;

if (!process.env.JWT_SECRET) {
	process.env.JWT_SECRET = 'dev-temporary-jwt-secret-change-in-production';
	console.warn('⚠️  JWT_SECRET não definido. Usando fallback inseguro (apenas DEV). Defina JWT_SECRET em produção!');
}

// Middlewares, estáticos e rotas serão registrados SOMENTE após conexão ao MongoDB

// Conectar ao MongoDB e iniciar servidor somente após conexão
async function startServer(attempt = 0) {
	const mongoUri = process.env.MONGO_URI || null;
	try {
		if (!mongoUri) {
			const msg = '❌ MONGO_URI não definida. Configure a conexão do MongoDB (Atlas) em produção.';
			console.error(msg);
			if (process.env.NODE_ENV === 'production') {
				process.exit(1);
			} else {
				const localUri = 'mongodb://localhost:27017/saas-ia-whatsapp';
				console.warn(`⚠️  Usando fallback local em DEV: ${localUri}`);
				await mongoose.connect(localUri, { useNewUrlParser: true, useUnifiedTopology: true });
				console.log('✅ Conectado ao MongoDB (DEV local)');
			}
		} else {
			await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
			console.log('✅ Conectado ao MongoDB');
		}

		// Registra middlewares, estáticos e rotas apenas uma vez, após conexão
	// Registra middlewares, estáticos e rotas apenas uma vez
	if (!initialized) {
		app.use(helmet());
		app.use(morgan('combined'));
		app.use(cors());
		app.use(express.json());
		app.use(express.urlencoded({ extended: true }));

		const buildDir = path.join(__dirname, '..', 'client', 'build');
		app.use(express.static(path.join(__dirname, '..', 'public'), { index: false }));
		app.use(express.static(buildDir));

		// Rotas API
		const webhookRoutes = require(path.join(__dirname, '..', 'src', 'routes', 'webhook'));
		const clientRoutes = require(path.join(__dirname, '..', 'src', 'routes', 'client'));
		const whatsappRoutes = require(path.join(__dirname, '..', 'src', 'routes', 'whatsapp'));
		const authRoutes = require(path.join(__dirname, '..', 'src', 'routes', 'auth'));
		const compromissoRoutes = require(path.join(__dirname, '..', 'src', 'routes', 'compromisso'));
		const publicRoutes = require(path.join(__dirname, '..', 'src', 'routes', 'public'));
		const aiRoutes = require(path.join(__dirname, '..', 'src', 'routes', 'ai'));
		app.use('/webhook', webhookRoutes);
		app.use('/client', clientRoutes);
		app.use('/whatsapp', whatsappRoutes);
		app.use('/api/auth', authRoutes);
		app.use('/compromisso', compromissoRoutes);
		app.use('/api/public', publicRoutes);
		app.use('/api/ai', aiRoutes);

		// Rota de teste para debugging
		app.post('/test-webhook', async (req, res) => {
			try {
				console.log('🧪 TESTE: Simulando webhook...', req.body);
				const { client_id, phone_number, message } = req.body;

				const Client = require(path.join(__dirname, '..', 'src', 'models', 'Client'));
				const client = await Client.findOne({ client_id });

				if (!client) {
					return res.status(404).json({ error: 'Cliente não encontrado' });
				}

				const IAEngine = require(path.join(__dirname, '..', 'src', 'services', 'IAEngineNovo'));
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

		// Rota raiz simples
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

		// Healthcheck
		app.get('/health', async (req, res) => {
			try {
				const dbState = mongoose.connection.readyState;
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

		// Rota explícita para demo institucional antiga (opcional)
		app.get('/demo', (req, res) => {
			const demoPath = path.join(__dirname, '..', 'public', 'demo.html');
			res.sendFile(demoPath);
		});

		// Fallback SPA: qualquer rota não-API retorna index.html
		app.get('*', (req, res, next) => {
			const isApi = req.originalUrl.startsWith('/api/') ||
								req.originalUrl.startsWith('/webhook') ||
								req.originalUrl.startsWith('/client') ||
								req.originalUrl.startsWith('/whatsapp') ||
								req.originalUrl.startsWith('/compromisso') ||
								req.originalUrl.startsWith('/health') ||
								req.originalUrl.startsWith('/public') ||
								req.originalUrl === '/demo';
			if (isApi) return next();
			const buildDir = path.join(__dirname, '..', 'client', 'build');
			res.sendFile(path.join(buildDir, 'index.html'));
		});

		initialized = true;
	}
	// Função interna para escutar, sem reimportar rotas em caso de conflito de porta
	const listen = (attemptListen = attempt) => {
		const server = app.listen(PORT, () => {
			if (attemptListen > 0) {
				console.log(`⚠️ Porta base ${BASE_PORT} ocupada. Usando porta alternativa ${PORT}.`);
			}
			console.log(`🚀 Servidor rodando na porta ${PORT}`);
			console.log(`📱 Webhook disponível em: http://localhost:${PORT}/webhook`);
			console.log(`⚙️ API do cliente em: http://localhost:${PORT}/client`);
		});

		server.on('error', (err) => {
			if (err.code === 'EADDRINUSE') {
				if (attemptListen < 5) {
					console.warn(`⚠️ Porta ${PORT} em uso. Tentando próxima porta...`);
					PORT = BASE_PORT + attemptListen + 1;
					listen(attemptListen + 1);
				} else {
					console.error('❌ Não foi possível encontrar uma porta livre após várias tentativas.');
					process.exit(1);
				}
			} else {
				console.error('❌ Erro ao iniciar servidor:', err);
				process.exit(1);
			}
		});
	};

	// Inicia servidor e, após iniciar, scheduler
	listen();
	try {
		const ReminderService = require(path.join(__dirname, '..', 'src', 'services', 'ReminderService'));
		ReminderService.start();
		console.log('⏰ Scheduler de lembretes iniciado (30min antes)');
	} catch (e) {
		console.warn('⚠️  Falha ao iniciar scheduler de lembretes:', e?.message || e);
	}
    
	} catch (err) {
		console.error('❌ Erro ao conectar ao MongoDB:', err);
		process.exit(1);
	}
}

// startServer e scheduler agora são iniciados somente após a conexão ao MongoDB
// Chama startServer com proteção global para evitar encerramento silencioso
(async () => {
	try {
		await startServer();
	} catch (err) {
		console.error('❌ Erro fatal ao iniciar servidor:', err);
		process.exit(1);
	}
})();

module.exports = app;
