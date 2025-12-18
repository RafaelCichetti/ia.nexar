const OpenAI = require('openai');

class IAEngine {
  static contemIntencaoAgendamento(msg) {
    // Palavras-chave para detectar intenção de agendar (inclui visita, orçamento, manutenção)
    const padroes = [
      /agendar|marcar|agenda|agendamento|compromisso|consulta|reuni[aã]o|visita|visitar|visita t[eé]cnica|vistoria|or[çc]amento|manuten[cç][aã]o|hor[áa]rio|reservar|atendimento|dispon[ií]vel/i
    ];
    return padroes.some(rx => rx.test(msg));
  }

  // Extração de data/hora em PT-BR: dd/mm [hora], hoje/amanhã, dias da semana (ex.: sexta 8, terça às 13h)
  static extrairDataHora(msg) {
    const texto = IAEngine.normalizar(msg);
    const agora = new Date();

    // 1) Formato dd/mm opcional com hora
    const rxDataHora = /(\d{1,2})\/(\d{1,2})(?:\s*(?:as|a|às|ás)?\s*(\d{1,2})(?::(\d{2}))?h?)?/i;
    const m1 = texto.match(rxDataHora);
    if (m1) {
      const [, d, m, h, mi] = m1;
      const ano = agora.getFullYear();
      const dia = parseInt(d, 10);
      const mes = parseInt(m, 10) - 1;
      const hora = h ? parseInt(h, 10) : 9;
      const minuto = mi ? parseInt(mi, 10) : 0;
      const dt = new Date(ano, mes, dia, hora, minuto, 0);
      return dt;
    }

    // 2) Hoje / Amanhã / Depois de amanhã com hora
    const rxHoraSimples = /(?:as|a|às|ás)?\s*(\d{1,2})(?::(\d{2}))?\s*(?:h|horas)?/i;
    if (/\bhoje\b/.test(texto)) {
      const m = texto.match(rxHoraSimples);
      const h = m ? parseInt(m[1], 10) : 9;
      const mi = m && m[2] ? parseInt(m[2], 10) : 0;
      const dt = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), h, mi, 0);
      return dt;
    }
    if (/amanha|amanhã/.test(texto)) {
      const base = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + 1);
      const m = texto.match(rxHoraSimples);
      const h = m ? parseInt(m[1], 10) : 9;
      const mi = m && m[2] ? parseInt(m[2], 10) : 0;
      return new Date(base.getFullYear(), base.getMonth(), base.getDate(), h, mi, 0);
    }
    if (/depois de amanha|depois de amanhã/.test(texto)) {
      const base = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + 2);
      const m = texto.match(rxHoraSimples);
      const h = m ? parseInt(m[1], 10) : 9;
      const mi = m && m[2] ? parseInt(m[2], 10) : 0;
      return new Date(base.getFullYear(), base.getMonth(), base.getDate(), h, mi, 0);
    }

    // 3) Dia da semana + hora (ex.: sexta 8, terca 13:30)
    const dias = ['domingo','segunda','terca','terça','quarta','quinta','sexta','sabado','sábado'];
    const mapDiaSemana = {
      domingo: 0, segunda: 1, terca: 2, 'terça': 2, quarta: 3, quinta: 4, sexta: 5, sabado: 6, 'sábado': 6
    };
    for (const diaNome of dias) {
      const rx = new RegExp(`${diaNome}.*?(?:as|a|às)?\s*(\d{1,2})(?::(\d{2}))?`, 'i');
      const m = texto.match(rx);
      if (m) {
        const alvoDow = mapDiaSemana[diaNome];
        // calcula próxima ocorrência do dia da semana
        const dowHoje = agora.getDay();
        let diff = alvoDow - dowHoje;
        if (diff <= 0) diff += 7; // sempre próxima ocorrência
        const base = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + diff);
        const h = parseInt(m[1], 10);
        const mi = m[2] ? parseInt(m[2], 10) : 0;
        return new Date(base.getFullYear(), base.getMonth(), base.getDate(), h, mi, 0);
      }
    }

    // 4) Apenas hora (ex.: 8h) – assume amanhã se horário de hoje já passou
    const mHora = texto.match(/^\s*(\d{1,2})(?::(\d{2}))?\s*(?:h|horas)?\s*$/i);
    if (mHora) {
      const h = parseInt(mHora[1], 10);
      const mi = mHora[2] ? parseInt(mHora[2], 10) : 0;
      let dt = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), h, mi, 0);
      if (dt < agora) dt = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + 1, h, mi, 0);
      return dt;
    }

    return null;
  }
  constructor() {
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-your-openai-api-key-here') {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      this.openaiModel = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
      console.log(`✅ OpenAI inicializado (modelo: ${this.openaiModel})`);
    } else {
      this.openai = null;
      this.openaiModel = null;
      console.log('⚠️  OpenAI API Key não configurada - modo simulação');
    }
    this.conversationCache = new Map();
    this.intentCache = new Map();
  }

  static normalizar(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
  }

  static extrairProcedimento(msg) {
  const procMatch = msg.match(/(?:para|de|fazer|ir|retirar|buscar|comprar|levar|pegar)\s+([\w\sãáéíóúçêôû]+?)(?:\.|,|$)/i);
  if (procMatch && procMatch[1]) return procMatch[1].trim();
  const diaMatch = msg.match(/(?:um dia|dia|data|horário|agenda)[^\w\s]*\s*(para|de)?\s*([\w\sãáéíóúçêôû]+?)(?:\.|,|$)/i);
    if (diaMatch && diaMatch[2]) return diaMatch[2].trim();
    return msg.length < 80 ? msg : 'Atendimento';
  }

  static extrairDescricao(msg) {
    return msg;
  }

  static tiposCompromisso = [
  { label: 'Consulta 🩺', value: 'Consulta' },
  { label: 'Reunião 📅', value: 'Reunião' },
  { label: 'Avaliação 📊', value: 'Avaliação' }
  ];

  static extrairTipoCompromisso(msg) {
    const tipos = IAEngine.tiposCompromisso.map(t => t.value.toLowerCase());
    const encontrado = tipos.find(tipo => msg.toLowerCase().includes(tipo));
    return encontrado ? IAEngine.tiposCompromisso.find(t => t.value.toLowerCase() === encontrado).value : null;
  }

  static _capitalizar(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  static extrairTipoOuProcedimento(msg) {
    const n = IAEngine.normalizar(msg);
    if (/visita( tecnica| t[eé]cnica)?|vistoria/.test(n)) return 'Visita';
    if (/reuni[aã]o/.test(n)) return 'Reunião';
    if (/consulta/.test(n)) return 'Consulta';
    if (/avalia[cç][aã]o/.test(n)) return 'Avaliação';
    if (/or[çc]amento/.test(n)) return 'Orçamento';
    if (/manuten[cç][aã]o/.test(n)) return 'Manutenção';
    if (/suporte/.test(n)) return 'Suporte';
    if (/demonstr[aá]?[cç][aã]o|\bdemo\b/.test(n)) return 'Demonstração';
    const proc = IAEngine.extrairProcedimento(msg).trim();
    if (!proc) return 'Atendimento';
    return IAEngine._capitalizar(proc.length > 40 ? 'Atendimento' : proc);
  }

  // Implemente IAEngine.extrairDataHora conforme sua necessidade

  async gerarResposta(mensagem, dadosDoCliente, telefoneUsuario) {
    try {
      // Comando de cancelamento em qualquer etapa
      const cancelar = /(cancelar|parar|desistir|sair|encerrar|deixa pra depois|deixar pra depois|nao quero|não quero)/i;
      if (cancelar.test(mensagem)) {
        const cacheKeyCancel = `${dadosDoCliente.client_id}:${telefoneUsuario}`;
        this.intentCache.delete(cacheKeyCancel);
        return {
          sucesso: true,
          resposta: 'Tudo bem! Cancelei o agendamento. Se precisar, posso ajudar com outra coisa.',
          modelo: 'agenda-propria',
          etapa: 'cancelado'
        };
      }
      const cacheKey = `${dadosDoCliente.client_id}:${telefoneUsuario}`;
      const msg = mensagem.trim();

      // Recupera ou inicializa o estado do usuário
      let estado = this.intentCache.get(cacheKey);
      if (!estado) {
        // Só entra no fluxo de agendamento se a mensagem indicar intenção
        if (!IAEngine.contemIntencaoAgendamento(msg)) {
          // Não é agendamento, responder normalmente
          if (this.openai) {
            const mensagens = await this._montarMensagensComContexto(dadosDoCliente, telefoneUsuario, msg);
            const resposta = await this.openai.chat.completions.create({
              model: this.openaiModel || 'gpt-3.5-turbo',
              messages: mensagens,
              temperature: 0.7
            });
            return {
              sucesso: true,
              resposta: resposta.choices[0].message.content,
              modelo: 'openai'
            };
          } else {
            return this._gerarRespostaDemo(msg, dadosDoCliente, telefoneUsuario);
          }
        }
        // Inicia fluxo inferindo tipo direto da mensagem e checando data inline
        const tipoInferido = IAEngine.extrairTipoOuProcedimento(msg);
        const dataInline = IAEngine.extrairDataHora(msg);
        estado = {
          etapa: dataInline && dataInline > new Date() ? 'confirmar' : 'data',
          tipo: tipoInferido,
          data: dataInline && dataInline > new Date() ? new Date(dataInline) : null,
          intent_msg: msg,
          titulo: tipoInferido || IAEngine.extrairProcedimento(msg),
          descricao: IAEngine.extrairDescricao(msg)
        };
        this.intentCache.set(cacheKey, estado);
        // Resposta inicial já pedindo data/hora (ou confirmando se já veio junto)
        if (estado.etapa === 'confirmar') {
          return {
            sucesso: true,
            resposta: `Ok, aqui está seu agendamento:\n• Compromisso: ${estado.tipo}\n• Data/Horário: ${estado.data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às ${estado.data.getHours().toString().padStart(2,'0')}:${estado.data.getMinutes().toString().padStart(2,'0')}\nEstá correto?`,
            modelo: 'agenda-propria',
            etapa: 'confirmar',
            opcoes: [ { label: '✅ Confirmar', value: 'confirmar' }, { label: '❌ Corrigir', value: 'corrigir' } ]
          };
        }
        return {
          sucesso: true,
          resposta: `Ótimo! Qual dia e horário você prefere para o compromisso de *${estado.tipo}*? (Exemplo: 05/09 às 15h)`,
          modelo: 'agenda-propria',
          etapa: 'data'
        };
      }

  // ETAPA 1 (fallback raro): Perguntar tipo de compromisso, se não foi possível inferir
  if (!estado.tipo && estado.etapa === 'tipo') {
        const tipo = IAEngine.extrairTipoCompromisso(msg);
        const dataInline = IAEngine.extrairDataHora(msg);
        if (tipo) {
          estado.tipo = tipo;
          // Se já veio data junto, pula direto para confirmação
          if (dataInline && dataInline > new Date()) {
            estado.data = new Date(dataInline);
            estado.etapa = 'confirmar';
          } else {
            estado.etapa = 'data';
          }
          this.intentCache.set(cacheKey, estado);
          return {
            sucesso: true,
            resposta: estado.data
              ? `Ok, aqui está seu agendamento:
• Compromisso: ${estado.tipo}
• Data/Horário: ${estado.data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às ${estado.data.getHours().toString().padStart(2,'0')}:${estado.data.getMinutes().toString().padStart(2,'0')}
Está correto?`
              : `Ótimo! Qual dia e horário você prefere para o compromisso de *${tipo}*? (Exemplo: 05/09 às 15h)`,
            modelo: 'agenda-propria',
            opcoes: estado.data ? [ { label: '✅ Confirmar', value: 'confirmar' }, { label: '❌ Corrigir', value: 'corrigir' } ] : [],
            etapa: estado.etapa,
            tipos: IAEngine.tiposCompromisso
          };
        } else {
          this.intentCache.set(cacheKey, estado);
          // Em vez de forçar opções fixas, pedir que o cliente descreva o tipo
          return {
            sucesso: true,
            resposta: 'Qual tipo de compromisso você deseja agendar? Você pode responder, por exemplo: "visita técnica", "reunião" ou "consulta".',
            modelo: 'agenda-propria',
            etapa: 'tipo'
          };
        }
      }

      // ETAPA 2: Perguntar data/hora
      if (estado.tipo && !estado.data && estado.etapa === 'data') {
        const dataAlvo = IAEngine.extrairDataHora(msg);
        if (!dataAlvo) {
          this.intentCache.set(cacheKey, estado);
          return {
            sucesso: true,
            resposta: 'Por favor, informe a data e horário no formato correto. Exemplo: 05/09 às 15h',
            modelo: 'agenda-propria',
            etapa: 'data'
          };
        }
        if (dataAlvo < new Date()) {
          this.intentCache.set(cacheKey, estado);
          return {
            sucesso: true,
            resposta: 'A data/hora informada já passou. Por favor, escolha um horário futuro.',
            modelo: 'agenda-propria',
            etapa: 'data'
          };
        }
        const Compromisso = require('../models/Compromisso');
        const data_inicio = new Date(dataAlvo);
        const data_fim = new Date(dataAlvo.getTime() + 60*60000);
        // Checagem de conflito por sobreposição (qualquer interseção de intervalos)
        const conflito = await Compromisso.findOne({
          client_id: dadosDoCliente.client_id,
          $or: [
            { data_inicio: { $lt: data_fim }, data_fim: { $gt: data_inicio } }
          ]
        });
        if (conflito) {
          this.intentCache.set(cacheKey, estado);
          return {
            sucesso: true,
            resposta: 'Já existe um compromisso agendado para este horário. Por favor, escolha outro horário.',
            modelo: 'agenda-propria',
            etapa: 'data'
          };
        }
        estado.data = data_inicio;
        estado.etapa = 'confirmar';
        this.intentCache.set(cacheKey, estado);
        return {
          sucesso: true,
          resposta: `Ok, aqui está seu agendamento:\n• Compromisso: ${estado.tipo}\n• Data/Horário: ${data_inicio.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às ${data_inicio.getHours().toString().padStart(2,'0')}:${data_inicio.getMinutes().toString().padStart(2,'0')}\nEstá correto?`,
          modelo: 'agenda-propria',
          opcoes: [ { label: '✅ Confirmar', value: 'confirmar' }, { label: '❌ Corrigir', value: 'corrigir' } ]
        };
      }

      // ETAPA 3: Confirmação
      if (estado.tipo && estado.data && estado.etapa === 'confirmar') {
        if (/confirmar|confirmado|sim|ok|certo|correto|isso|isso mesmo|pode ser|aceito|perfeito|exatamente|👍|✅/i.test(msg)) {
          const Compromisso = require('../models/Compromisso');
          const compromisso = await Compromisso.create({
            client_id: dadosDoCliente.client_id,
            user_phone: telefoneUsuario || '',
            nome_cliente: dadosDoCliente.nome_usuario_whatsapp || dadosDoCliente.name || 'Cliente',
            procedimento: estado.titulo || estado.tipo,
            descricao: estado.descricao ? `Agendado via WhatsApp: ${estado.descricao}` : `Agendado via WhatsApp`,
            data_inicio: estado.data,
            data_fim: new Date(estado.data.getTime() + 60*60000),
            status: 'agendado',
            criado_por: 'ia'
          });
          this.intentCache.delete(cacheKey);
          return {
            sucesso: true,
            resposta: 'Seu compromisso foi agendado com sucesso ✅. Enviarei um lembrete 30 minutos antes do horário.',
            modelo: 'agenda-propria',
            etapa: 'final',
            compromisso
          };
        } else if (/corrigir|nao|não|errado|alterar|mudar|❌/i.test(msg)) {
          estado.data = null;
          estado.etapa = 'data';
          this.intentCache.set(cacheKey, estado);
          return {
            sucesso: true,
            resposta: `Sem problemas! Qual dia e horário você prefere para o compromisso de *${estado.tipo}*? (Exemplo: 05/09 às 15h)`,
            modelo: 'agenda-propria',
            etapa: 'data'
          };
        } else if (cancelar.test(msg)) {
          this.intentCache.delete(cacheKey);
          return {
            sucesso: true,
            resposta: 'Sem problemas! Cancelei o agendamento. Se quiser retomar depois é só me avisar.',
            modelo: 'agenda-propria',
            etapa: 'cancelado'
          };
        } else {
          this.intentCache.set(cacheKey, estado);
          return {
            sucesso: true,
            resposta: 'Confirma este agendamento? Você pode responder: sim, ok, correto, confirmar ou ❌ corrigir.',
            modelo: 'agenda-propria',
            etapa: 'confirmar',
            opcoes: [ { label: '✅ Confirmar', value: 'confirmar' }, { label: '❌ Corrigir', value: 'corrigir' } ]
          };
        }
      }

      // Fallback: reinicia fluxo
      this.intentCache.delete(cacheKey);
      return {
        sucesso: true,
        resposta: `Vamos começar o agendamento!\nQual tipo de compromisso você deseja agendar?\n${IAEngine.tiposCompromisso.map(t=>t.label).join(' | ')}`,
        modelo: 'agenda-propria',
        etapa: 'tipo',
        opcoes: IAEngine.tiposCompromisso
      };
    } catch (error) {
      return {
        sucesso: false,
        resposta: 'Erro ao processar agendamento: ' + error.message,
        erro: error.message
      };
    }
  }

          async logConversa(userMessage, aiResponse, clientData, phoneNumber, metadata) {
            try {
              const ConversationLog = require('../models/ConversationLog');
              const log = new ConversationLog({
                client_id: clientData.client_id,
                user_phone: phoneNumber,
                user_message: userMessage,
                ai_response: aiResponse,
                model_used: metadata.model,
                tokens_used: metadata.tokens_used || 0,
                cost_usd: metadata.cost_usd || 0,
                response_time_ms: metadata.response_time_ms || 0,
                context_used: metadata.context_used || false,
                success: metadata.success,
                error_message: metadata.error_message || null,
                metadata: {
                  prompt_tokens: metadata.prompt_tokens || 0,
                  completion_tokens: metadata.completion_tokens || 0,
                  temperature: 0.7,
                  assistant_name: clientData.ai_assistant_name || null
                }
              });
              await log.save();
            } catch (error) {
              console.error('❌ Erro ao logar conversa:', error.message);
            }
          }

          calcularCusto(tokens) {
            const precoPor1kTokens = 0.002;
            return (tokens / 1000) * precoPor1kTokens;
          }

          montarPromptPersonalizado(dadosDoCliente) {
            const { name, ai_instructions, ai_assistant_name } = dadosDoCliente;
            if (ai_instructions && ai_instructions.trim()) {
              let prompt = ai_instructions.trim();
              if (ai_assistant_name && ai_assistant_name.trim()) {
                prompt = `Você é ${ai_assistant_name}, assistente virtual da empresa "${name}".\n\n${prompt}`;
              } else {
                prompt = `Você é o assistente virtual da empresa "${name}".\n\n${prompt}`;
              }
              prompt += `\n\nREGRAS IMPORTANTES:\n- NUNCA mencione que você é uma IA ou ChatGPT\n- SEMPRE aja como um funcionário real da empresa\n- Se não souber algo específico, seja honesto e ofereça alternativas de contato\n- Mantenha sempre o foco nos produtos/serviços da empresa`;
              return prompt;
            }
            let prompt = '';
            if (ai_assistant_name && ai_assistant_name.trim()) {
              prompt = `Você é ${ai_assistant_name}, assistente virtual da empresa "${name}".`;
            } else {
              prompt = `Você é o assistente virtual da empresa "${name}".`;
            }
            const businessInfo = (dadosDoCliente.business_info || '').trim();
            if (businessInfo) {
              prompt += `\n\nInformações do negócio: ${businessInfo}`;
            }
  prompt += `\n\n- Se não souber algo específico, seja honesto e ofereça alternativas de contato\n- Mantenha sempre o foco nos produtos/serviços da empresa\n- Seja proativo em oferecer ajuda\n- Faça perguntas para entender melhor a necessidade do cliente`;
            return prompt;
          }

          _gerarRespostaDemo(mensagem, dadosDoCliente, telefoneUsuario) {
            return {
              sucesso: true,
              resposta: 'Esta é uma resposta de teste. Configure sua API Key do OpenAI para usar o ChatGPT.',
              modelo: 'demo',
              tokens_usados: 0
            };
          }
}

// Métodos auxiliares adicionais
IAEngine.prototype._montarMensagensComContexto = async function(dadosDoCliente, telefoneUsuario, mensagemAtual) {
  const manterContexto = dadosDoCliente?.ai_features?.maintain_context !== false; // default true
  const mensagens = [];
  mensagens.push({ role: 'system', content: this.montarPromptPersonalizado(dadosDoCliente) });

  if (!manterContexto) {
    mensagens.push({ role: 'user', content: mensagemAtual });
    return mensagens;
  }

  const ConversationLog = require('../models/ConversationLog');
  // Carrega TODO o histórico do cliente (ordenado crescente) para máxima contextualização
  let historico = await ConversationLog.find({
    client_id: dadosDoCliente.client_id,
    user_phone: telefoneUsuario
  }).sort({ created_at: 1 }).lean();

  // Identifica assunto principal (primeira menção de um produto relevante) e armazena em cache
  const cacheKey = `${dadosDoCliente.client_id}:${telefoneUsuario}`;
  if (!this.conversationCache.has(cacheKey)) {
    this.conversationCache.set(cacheKey, {});
  }
  const estadoCache = this.conversationCache.get(cacheKey);

  if (!estadoCache.assuntoPrincipal) {
    const termosProduto = ['celular','iphone','smartphone','telefone','computador','notebook','laptop','geladeira','refrigerador','freezer','ar condicionado','tv','televisao','televisão','fogao','fogão','microondas','micro-ondas','lavadora','maquina de lavar','máquina de lavar','colchao','colchão','cama'];
    for (const log of historico) {
      const norm = IAEngine.normalizar(log.user_message);
      const achou = termosProduto.find(t => norm.includes(t));
      if (achou) { estadoCache.assuntoPrincipal = achou; break; }
    }
  }

  // Se o usuário mudar de categoria radicalmente, pedir confirmação antes de trocar
  const normAtual = IAEngine.normalizar(mensagemAtual);
  if (estadoCache.assuntoPrincipal) {
    const termosOutros = ['computador','notebook','laptop','celular','smartphone','telefone','geladeira','refrigerador','freezer','ar condicionado','tv','televisao','televisão'];
    const achouNovo = termosOutros.find(t => normAtual.includes(t) && t !== estadoCache.assuntoPrincipal);
    if (achouNovo) {
      // Injeta instrução para o modelo confirmar a troca de foco
      mensagens.push({ role: 'system', content: `ATENÇÃO: O cliente mencionou potencial novo produto "${achouNovo}" mas o foco original era "${estadoCache.assuntoPrincipal}". Confirme com o cliente antes de migrar o atendimento para o novo produto.` });
    }
  }

  // Montagem do histórico completo com controle de tamanho (para evitar ultrapassar limites)
  // Aproximação: ~4 caracteres ~ 1 token. Definimos limite alvo ~ 6k tokens => ~24k caracteres.
  const LIMITE_CHARS = 24000;
  let acumulado = 0;
  const blocosCompactados = [];
  const mensagensSequenciais = [];

  for (const log of historico) {
    const userMsg = log.user_message || '';
    const aiMsg = log.ai_response || '';
    const parChars = userMsg.length + aiMsg.length;
    if (acumulado + parChars <= LIMITE_CHARS) {
      mensagensSequenciais.push({ role: 'user', content: userMsg });
      if (aiMsg) mensagensSequenciais.push({ role: 'assistant', content: aiMsg });
      acumulado += parChars;
    } else {
      // Armazena o excedente em blocos para sumarização leve
      blocosCompactados.push(`U:${userMsg} A:${aiMsg}`);
    }
  }

  if (blocosCompactados.length) {
    const resumoExcedente = blocosCompactados.slice(-50).join(' | ').slice(0, 4000);
    mensagens.push({ role: 'system', content: `Resumo compacto de partes antigas da conversa (conserve coerência, não repita perguntas já feitas): ${resumoExcedente}` });
  }

  if (estadoCache.assuntoPrincipal) {
    mensagens.push({ role: 'system', content: `Assunto / produto principal identificado até agora: ${estadoCache.assuntoPrincipal}. Mantenha consistência; só troque após confirmação explícita do cliente.` });
  }

  // Injeta histórico selecionado
  mensagens.push(...mensagensSequenciais);
  // Mensagem atual do usuário
  mensagens.push({ role: 'user', content: mensagemAtual });
  return mensagens;
};

IAEngine.prototype._resumirHistorico = function(historico) {
  if (!historico || historico.length === 0) return '';
  const ultimas = historico.slice(-5); // pega algumas mais recentes
  // Cria um mini-resumo heurístico simples
  const temas = [];
  for (const h of ultimas) {
    const txt = IAEngine.normalizar(h.user_message).slice(0, 80);
    temas.push(txt);
  }
  return `Últimos tópicos do cliente: ${temas.join(' | ')}`;
};

IAEngine.prototype._assuntoAtual = function(historico) {
  if (!historico || historico.length === 0) return '';
  // Procura da mensagem mais recente do usuário que mencione produto/tema
  const termosProduto = ['geladeira','refrigerador','freezer','ar condicionado','notebook','celular','tv','televisao','televisão','fogao','fogão','microondas','micro-ondas','lavadora','maquina de lavar','máquina de lavar','lava e seca','cama','colchao','colchão'];
  for (const h of historico) {
    const u = IAEngine.normalizar(h.user_message);
    const achado = termosProduto.find(t => u.includes(t));
    if (achado) return `Produto/tema principal: ${achado}`;
  }
  // fallback: usa últimas 3 palavras significativas da última mensagem do usuário
  const last = historico[0];
  if (last && last.user_message) {
    const tokens = IAEngine.normalizar(last.user_message).split(/[^a-z0-9]+/).filter(x => x && x.length > 2);
    return `Tema recente: ${tokens.slice(-5).join(' ')}`;
  }
  return '';
};

module.exports = IAEngine;
        