const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const path = require('path');
const fs = require('fs');
const IAEngine = require('./IAEngineNovo');

class WhatsAppService {
  constructor() {
    this.clients = new Map(); // clientId -> Client
    this.qrCodes = new Map(); // clientId -> base64 png
    this.initializing = new Set(); // guarda para evitar init concorrente
    this.pendingReplies = new Map(); // chatId -> { text, clientId, ts }
    this.clientReady = new Map(); // clientId -> boolean
  // Instância única da IA para manter caches (intentCache + conversationCache)
  this.iaEngine = new IAEngine();
    this.initializeService();
  }

  initializeService() {
    console.log('🚀 WhatsApp Service inicializado');
    this._startReplyLoop();
  }

  _startReplyLoop() {
    if (this._replyLoopStarted) return;
    this._replyLoopStarted = true;

    const intervalMs = Number(process.env.WA_REPLY_INTERVAL_MS || 1500);
    setInterval(async () => {
      for (const [chatId, payload] of this.pendingReplies.entries()) {
        const { clientId, text } = payload || {};
        if (!clientId || !text) {
          this.pendingReplies.delete(chatId);
          continue;
        }

        const waClient = this.clients.get(clientId);
        if (!waClient) {
          console.warn(`⚠️ Cliente WhatsApp não encontrado para ${clientId}. Abortando envio.`);
          this.pendingReplies.delete(chatId);
          continue;
        }

        let chat;
        try {
          chat = await waClient.getChatById(chatId);
        } catch (e) {
          console.warn('⚠️ Chat não encontrado, abortando envio:', chatId);
          this.pendingReplies.delete(chatId);
          continue;
        }

        if (!chat || !chat.id || !chat.id._serialized) {
          console.warn('⚠️ Chat inválido, abortando envio:', chatId);
          this.pendingReplies.delete(chatId);
          continue;
        }

        if (chat.archived || chat.isMuted) {
          console.warn('⚠️ Chat arquivado/mutado, ignorando envio:', chatId);
          this.pendingReplies.delete(chatId);
          continue;
        }

        try {
          await chat.sendMessage(text);
        } catch (err) {
          console.warn('⚠️ Falha controlada ao enviar WhatsApp:', err?.message || err);
        } finally {
          this.pendingReplies.delete(chatId);
        }
      }
    }, Math.max(1000, intervalMs));
  }

  // --- Helpers internos ---
  _resolvePuppeteerConfig() {
    const isWin = process.platform === 'win32';
    const isLinux = process.platform === 'linux';
    const isMac = process.platform === 'darwin';

    // headless
  const envHeadless = String(process.env.WA_HEADLESS || 'true').toLowerCase();
  const headless = envHeadless === 'false' ? false : 'new';
  const headlessMode = String(process.env.WA_HEADLESS_MODE || 'new').toLowerCase(); // 'new' | 'old'

    // args base
    const baseArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--disable-extensions',
    ];
  if (headless !== false) baseArgs.push(headlessMode === 'old' ? '--headless' : '--headless=new');

    // args extras via env
    if (process.env.PUPPETEER_ARGS) {
      const extras = process.env.PUPPETEER_ARGS.split(/\s+/).filter(Boolean);
      baseArgs.push(...extras);
    }

    // detectar executablePath
    let executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;

    const pathExists = (p) => {
      try {
        return !!p && fs.existsSync(p);
      } catch (_) {
        return false;
      }
    };

    const pf = process.env['ProgramFiles'];
    const pf86 = process.env['ProgramFiles(x86)'];
    const lapp = process.env['LOCALAPPDATA'];
    const winCandidates = [
      executablePath,
      process.env.CHROME_PATH,
      process.env.EDGE_PATH,
      pf ? path.join(pf, 'Google', 'Chrome', 'Application', 'chrome.exe') : null,
      pf86 ? path.join(pf86, 'Google', 'Chrome', 'Application', 'chrome.exe') : null,
      lapp ? path.join(lapp, 'Google', 'Chrome', 'Application', 'chrome.exe') : null,
      pf ? path.join(pf, 'Microsoft', 'Edge', 'Application', 'msedge.exe') : null,
      pf86 ? path.join(pf86, 'Microsoft', 'Edge', 'Application', 'msedge.exe') : null,
      lapp ? path.join(lapp, 'Microsoft', 'Edge', 'Application', 'msedge.exe') : null,
      // Brave como alternativa
      pf ? path.join(pf, 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe') : null,
      pf86 ? path.join(pf86, 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe') : null,
      lapp ? path.join(lapp, 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe') : null,
      // Opera (Chromium-based)
      pf ? path.join(pf, 'Opera', 'opera.exe') : null,
      pf86 ? path.join(pf86, 'Opera', 'opera.exe') : null,
      lapp ? path.join(lapp, 'Programs', 'Opera', 'opera.exe') : null,
    ].filter(Boolean);

    const macCandidates = [
      executablePath,
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
    ].filter(Boolean);

    const linuxCandidates = [
      executablePath,
      '/usr/bin/google-chrome-stable',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
      '/snap/bin/chromium',
    ].filter(Boolean);

    let resolvedExec;
    const candidates = isWin ? winCandidates : isMac ? macCandidates : linuxCandidates;
    for (const c of candidates) {
      if (pathExists(c)) {
        resolvedExec = c;
        break;
      }
    }

    if (resolvedExec) {
      console.log(`[WA] Usando navegador para Puppeteer: ${resolvedExec}`);
    } else if (executablePath && !pathExists(executablePath)) {
      console.warn(`[WA] PUPPETEER_EXECUTABLE_PATH definido, mas não encontrado: ${executablePath}. Tentando padrão do Puppeteer.`);
    } else {
      console.log('[WA] Nenhum executablePath específico encontrado. Puppeteer tentará detectar automaticamente.');
      if (isWin) {
        console.log('[WA] Candidatos testados (Windows):');
        console.log(candidates.join(' | '));
        console.log('[WA] Se nenhum for válido, defina PUPPETEER_EXECUTABLE_PATH no .env com o caminho do Chrome/Edge.');
      }
    }

    const config = { headless, protocolTimeout: 120000, args: baseArgs };
    if (resolvedExec) config.executablePath = resolvedExec;
    return config;
  }

  _buildClient(clientId) {
    const puppeteerCfg = this._resolvePuppeteerConfig();
    return new Client({
      authStrategy: new LocalAuth({
        clientId,
        dataPath: path.join(__dirname, '../../.wwebjs_auth'),
      }),
      markOnlineOnConnect: false,
      restartOnAuthFail: true,
      takeoverOnConflict: true,
      takeoverTimeoutMs: 30000,
      qrMaxRetries: 3,
      authTimeoutMs: 60000,
      puppeteer: puppeteerCfg,
    });
  }

  _attachEventHandlers(client, clientId) {
    client.on('qr', async (qr) => {
      console.log(`📱 QR Code gerado para ${clientId}`);
      try {
        const qrCodeImage = await qrcode.toDataURL(qr);
        const base64Data = qrCodeImage.replace(/^data:image\/png;base64,/, '');
        this.qrCodes.set(clientId, base64Data);
      } catch (error) {
        console.error(`❌ Erro ao gerar QR Code para ${clientId}:`, error);
      }
    });

    client.on('change_state', (state) => {
      console.log(`🔄 Estado do cliente ${clientId} mudou para:`, state);
    });

    client.on('loading_screen', (percent, message) => {
      console.log(`⏳ Carregando (${clientId}): ${percent}% - ${message}`);
    });

    client.on('ready', () => {
      console.log(`✅ Cliente ${clientId} conectado ao WhatsApp!`);
      this.qrCodes.delete(clientId);
      this.clientReady.set(clientId, true);
      console.log(`[DEBUG] Cliente ${clientId} está pronto e aguardando mensagens.`);
      client
        .getChats()
        .then((chats) => {
          console.log(`[DEBUG] Total de chats carregados para ${clientId}:`, chats.length);
        })
        .catch((e) => {
          console.log(`[DEBUG] Erro ao listar chats para ${clientId}:`, e);
        });
    });

    client.on('authenticated', () => {
      console.log(`🔐 Cliente ${clientId} autenticado`);
    });

    client.on('auth_failure', (msg) => {
      console.error(`❌ Falha na autenticação para ${clientId}:`, msg);
    });

    client.on('disconnected', (reason) => {
      console.log(`📵 Cliente ${clientId} desconectado:`, reason);
      this.clients.delete(clientId);
      this.qrCodes.delete(clientId);
      this.clientReady.delete(clientId);
      console.log(`[DEBUG] Cliente ${clientId} foi desconectado. Motivo:`, reason);
    });

    client.on('message', async (message) => {
      console.log(`[DEBUG] Evento 'message' disparado para cliente ${clientId}.`);
      console.log(`[DEBUG] Dados da mensagem:`, {
        from: message.from,
        to: message.to,
        body: message.body,
        type: message.type,
        isGroupMsg: message.isGroupMsg,
      });
      try {
        await this.handleIncomingMessage(clientId, message);
      } catch (err) {
        console.error(`[DEBUG] Erro ao processar mensagem para cliente ${clientId}:`, err);
      }
    });
  }

  // --- Sessão ---
  async createClientSession(clientId) {
    console.log(`📱 Criando sessão WhatsApp para cliente: ${clientId}`);

    if (this.initializing.has(clientId)) {
      console.log(`⏳ Inicialização já em andamento para ${clientId}`);
      return { success: true, message: 'Inicializando', status: 'connecting' };
    }

    this.initializing.add(clientId);
    try {
      // Se já existe uma sessão, desconectar primeiro
      if (this.clients.has(clientId)) {
        await this.disconnectClient(clientId);
        // Aguardar liberação de arquivo no Windows para evitar EBUSY em Cookies-journal
        await new Promise((r) => setTimeout(r, 300));
      }

      let client = this._buildClient(clientId);
      this._attachEventHandlers(client, clientId);
      this.clients.set(clientId, client);

      // Inicializar cliente com até 3 tentativas em caso de ProtocolError/context destroyed
      let lastErr;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          await client.initialize();
          lastErr = undefined;
          break;
        } catch (err) {
          lastErr = err;
          const msg = String(err?.message || err);
          if (/Execution context was destroyed|ProtocolError/i.test(msg)) {
            console.warn(`⚠️ Erro de contexto ao inicializar sessão ${clientId} (tentativa ${attempt}/3).`);
            try { await client.destroy().catch(() => {}); } catch {}
            await new Promise((r) => setTimeout(r, 800 + attempt * 400));
            client = this._buildClient(clientId);
            this._attachEventHandlers(client, clientId);
            this.clients.set(clientId, client);
            continue;
          } else {
            console.error(`[WA] Falha ao inicializar sessão ${clientId}:`, err);
            break;
          }
        }
      }
      if (lastErr) {
        throw lastErr;
      }

      return { success: true, message: 'Sessão iniciada', status: 'connecting' };
    } catch (error) {
      console.error(`❌ Erro ao criar sessão para ${clientId}:`, error);
      const msg = String(error?.message || error);
      return { success: false, message: 'Erro ao inicializar WhatsApp', error: msg };
    } finally {
      this.initializing.delete(clientId);
    }
  }

  async getConnectionStatus(clientId) {
    try {
      const client = this.clients.get(clientId);
      if (!client) {
        return {
          success: true,
          status: 'disconnected',
          message: 'WhatsApp não conectado',
          hasQrCode: false,
        };
      }

      const hasQrCode = this.qrCodes.has(clientId);
      if (hasQrCode) {
        return {
          success: true,
          status: 'qr_ready',
          message: 'Escaneie o QR Code para conectar',
          hasQrCode: true,
          qrCode: this.qrCodes.get(clientId),
        };
      }

      if (!client.pupPage || !this.clientReady.get(clientId)) {
        return {
          success: true,
          status: 'initializing',
          message: 'Inicializando sessão do WhatsApp... ',
          hasQrCode: false,
          qrCode: null,
        };
      }

      const state = await client.getState();

      let status = 'disconnected';
      let message = 'Status desconhecido';

      switch (state) {
        case 'CONNECTED':
          status = 'ready';
          message = 'WhatsApp conectado e pronto';
          break;
        case 'OPENING':
          status = 'connecting';
          message = 'Conectando ao WhatsApp...';
          break;
        case 'PAIRING':
          status = 'qr_ready';
          message = 'Escaneie o QR Code para conectar';
          break;
        case 'TIMEOUT':
          status = 'disconnected';
          message = 'Timeout na conexão';
          break;
        default:
          if (hasQrCode) {
            status = 'qr_ready';
            message = 'QR Code disponível';
          } else {
            status = 'connecting';
            message = 'Preparando conexão...';
          }
      }

      return {
        success: true,
        status,
        message,
        hasQrCode,
        qrCode: hasQrCode ? this.qrCodes.get(clientId) : null,
      };
    } catch (error) {
      console.error(`❌ Erro ao obter status para ${clientId}:`, error);
      return {
        success: true,
        status: 'disconnected',
        message: 'Erro ao verificar status',
        hasQrCode: false,
      };
    }
  }

  async getQRCode(clientId) {
    try {
      const qrCode = this.qrCodes.get(clientId);
      if (qrCode) {
        return { success: true, qrCode };
      }
      return { success: false, message: 'QR Code não disponível' };
    } catch (error) {
      console.error(`❌ Erro ao obter QR Code para ${clientId}:`, error);
      return { success: false, message: 'Erro ao gerar QR Code' };
    }
  }

  async disconnectClient(clientId) {
    try {
      console.log(`📵 Desconectando cliente ${clientId}`);
      const client = this.clients.get(clientId);

      if (client) {
        // Tentar fechar recursos do Puppeteer antes (evita EBUSY em Windows)
        try {
          if (client.pupPage && typeof client.pupPage.close === 'function') {
            await client.pupPage.close().catch(() => {});
          }
          if (client.pupBrowser && typeof client.pupBrowser.close === 'function') {
            await client.pupBrowser.close().catch(() => {});
          }
        } catch (e) {
          console.log(`[DEBUG] Erro ao fechar Puppeteer para ${clientId} (ignorado):`, e?.message || e);
        }

        // Tentar destruir com retry e tolerância a EBUSY
        const destroyOnce = async () => {
          try {
            await client.destroy();
          } catch (err) {
            if (err && (err.code === 'EBUSY' || /EBUSY|resource busy|locked/i.test(String(err)))) {
              console.warn(`⚠️ EBUSY ao destruir sessão ${clientId}. Aguardando e tentando novamente...`);
              await new Promise((r) => setTimeout(r, 500));
              try {
                await client.destroy();
              } catch (err2) {
                if (err2 && (err2.code === 'EBUSY' || /EBUSY|resource busy|locked/i.test(String(err2)))) {
                  console.warn('⚠️ EBUSY persistente ao destruir sessão. Ignorando limpeza de arquivos para evitar crash.');
                } else {
                  throw err2;
                }
              }
            } else {
              throw err;
            }
          }
        };

        await destroyOnce();
        this.clients.delete(clientId);
      }

      this.qrCodes.delete(clientId);
      return { success: true, message: 'WhatsApp desconectado' };
    } catch (error) {
      console.error(`❌ Erro ao desconectar ${clientId}:`, error);
      return { success: false, message: 'Erro ao desconectar' };
    }
  }

  async resetSession(clientId) {
    try {
      // Garante desconexão
      await this.disconnectClient(clientId);

      const authBase = path.join(__dirname, '../../.wwebjs_auth');
      const sessionDir = path.join(authBase, `session-${clientId}`);
      console.log(`🧹 Removendo sessão local em: ${sessionDir}`);

      if (fs.existsSync(sessionDir)) {
        // Remoção recursiva segura
        const rm = (p) => {
          if (!fs.existsSync(p)) return;
          const stat = fs.lstatSync(p);
          if (stat.isDirectory()) {
            for (const f of fs.readdirSync(p)) rm(path.join(p, f));
            fs.rmdirSync(p);
          } else {
            try { fs.unlinkSync(p); } catch {}
          }
        };
        rm(sessionDir);
      }
      return { success: true, message: 'Sessão local removida' };
    } catch (e) {
      console.error(`❌ Erro ao resetar sessão ${clientId}:`, e);
      return { success: false, message: 'Erro ao resetar sessão' };
    }
  }

  // --- Mensagens ---
  async handleIncomingMessage(clientId, message) {
    try {
      console.log(`📨 Mensagem recebida para ${clientId}:`, message.body);

      // Ignorar mensagens de status do WhatsApp e de grupos
      if (
        message.type !== 'chat' ||
        message.fromMe ||
        message.isGroupMsg ||
        (message.to && message.to.endsWith('@g.us')) ||
        (message.from && message.from.endsWith('@g.us'))
      ) {
        return;
      }

      const chatId = message.from;

      const ClientModel = require('../models/Client');
      const cliente = await ClientModel.findOne({ client_id: clientId });
      if (!cliente) {
        console.log(`❌ Cliente com client_id ${clientId} não encontrado`);
        return;
      }

      console.log(`🤖 Processando mensagem com IA OpenAI para cliente: ${cliente.name}`);

  const iaEngine = this.iaEngine; // reutiliza instância compartilhada

      const numeroLimpo = message.from.replace('@c.us', '');

      let nome_usuario_whatsapp = '';
      if (message._data && message._data.notifyName) {
        nome_usuario_whatsapp = message._data.notifyName;
      } else if (message._data && message._data.pushName) {
        nome_usuario_whatsapp = message._data.pushName;
      } else if (message.sender && message.sender.pushname) {
        nome_usuario_whatsapp = message.sender.pushname;
      }

      const clienteComNomeUsuario = { ...(cliente.toObject?.() || cliente), nome_usuario_whatsapp };
  const inicio = Date.now();
  const resultado = await iaEngine.gerarResposta(message.body, clienteComNomeUsuario, numeroLimpo);

      try {
        if (resultado && resultado.sucesso && resultado.resposta) {
          console.log(`✅ Resposta da IA OpenAI: ${resultado.resposta}`);
          this.pendingReplies.set(chatId, {
            text: resultado.resposta,
            clientId,
            ts: Date.now()
          });

          cliente.stats.total_messages += 1;
          cliente.stats.ai_responses += 1;
          cliente.stats.last_message = new Date();
          await cliente.save();

          console.log(`📤 Resposta IA OpenAI enviada via WhatsApp para ${numeroLimpo}`);

          // Log de conversa para manter histórico e permitir contexto nas próximas mensagens
          try {
            const metadata = {
              model: resultado.modelo || 'desconhecido',
              tokens_used: resultado.tokens_usados || 0,
              cost_usd: 0,
              response_time_ms: Date.now() - inicio,
              context_used: true,
              success: true
            };
            await iaEngine.logConversa(message.body, resultado.resposta, clienteComNomeUsuario, numeroLimpo, metadata);
          } catch (e) {
            console.warn('⚠️  Falha ao registrar ConversationLog:', e.message);
          }
        } else {
          console.log('⚠️  IA OpenAI não gerou resposta - usando default do cliente');
          if (cliente.default_response) {
            this.pendingReplies.set(chatId, {
              text: cliente.default_response,
              clientId,
              ts: Date.now()
            });
            cliente.stats.default_responses += 1;
            await cliente.save();

            // Log também a resposta default para manter trilha histórica
            try {
              await iaEngine.logConversa(message.body, cliente.default_response, clienteComNomeUsuario, numeroLimpo, {
                model: 'default',
                tokens_used: 0,
                cost_usd: 0,
                response_time_ms: Date.now() - inicio,
                context_used: false,
                success: true
              });
            } catch (e) {
              console.warn('⚠️  Falha ao registrar ConversationLog (default):', e.message);
            }
          }
        }
      } catch (sendErr) {
        console.error(`❌ Erro ao enviar mensagem WhatsApp para ${clientId}:`, sendErr?.message || sendErr);
        return;
      }
    } catch (error) {
      console.error(`❌ Erro ao processar mensagem IA OpenAI para ${clientId}:`, error);
      console.log('🚫 Erro na IA OpenAI - mensagem não respondida');
    }
  }

  async sendMessage(clientId, number, message) {
    try {
      const client = this.clients.get(clientId);
      if (!client) {
        return { success: false, message: 'Cliente não conectado' };
      }
      const chatId = number.includes('@c.us') ? number : `${number}@c.us`;
      let chat;
      try {
        chat = await client.getChatById(chatId);
      } catch (e) {
        console.warn('⚠️ Chat não encontrado, abortando envio:', chatId);
        return { success: false, message: 'Chat não encontrado' };
      }
      if (!chat) {
        console.warn('⚠️ Chat undefined, abortando envio:', chatId);
        return { success: false, message: 'Chat não encontrado' };
      }
      await chat.sendMessage(message);
      return { success: true, message: 'Mensagem enviada' };
    } catch (error) {
      console.error(`❌ Erro ao enviar mensagem para ${clientId}:`, error);
      return { success: false, message: 'Erro ao enviar mensagem' };
    }
  }

  async sendTestMessage(clientId, number, message) {
    return this.sendMessage(clientId, number, message);
  }

  getConnectedClients() {
    return Array.from(this.clients.keys());
  }
}

const whatsappService = new WhatsAppService();
module.exports = whatsappService;
