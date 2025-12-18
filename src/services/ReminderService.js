const Compromisso = require('../models/Compromisso');
const WhatsAppService = require('./WhatsAppService');

function pad2(n) { return String(n).padStart(2, '0'); }

async function processarLembretes() {
  try {
    const agora = new Date();
    const daqui30 = new Date(agora.getTime() + 30 * 60000);

    // Janela de tolerância: compromissos entre 29 e 31 minutos
    const janelaInicio = new Date(agora.getTime() + 29 * 60000);
    const janelaFim = new Date(agora.getTime() + 31 * 60000);

    const proximos = await Compromisso.find({
      status: 'agendado',
      reminder_30_sent: false,
      data_inicio: { $gte: janelaInicio, $lte: janelaFim }
    }).limit(50);

    for (const c of proximos) {
      if (!c.user_phone || !c.client_id) {
        continue;
      }
      const hora = `${pad2(c.data_inicio.getHours())}:${pad2(c.data_inicio.getMinutes())}`;
      const msg = `Lembrete: seu compromisso de ${c.procedimento} é hoje às ${hora}. Se precisar reagendar, responda esta mensagem.`;
      try {
        const r = await WhatsAppService.sendMessage(String(c.client_id), c.user_phone, msg);
        if (r && r.success) {
          c.reminder_30_sent = true;
          await c.save();
        }
      } catch (e) {
        // Mantém como não enviado; tentará novamente na próxima janela se ainda dentro do range
        // Opcional: logar em ConversationLog com erro
      }
    }
  } catch (err) {
    // Evita crash do scheduler por exceções
  }
}

let intervalId = null;

function start() {
  if (intervalId) return;
  // Executa a cada 60s
  intervalId = setInterval(processarLembretes, 60 * 1000);
}

function stop() {
  if (intervalId) clearInterval(intervalId);
  intervalId = null;
}

module.exports = { start, stop, _tick: processarLembretes };
