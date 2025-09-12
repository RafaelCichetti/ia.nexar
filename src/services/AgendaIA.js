const Compromisso = require('../models/Compromisso');

/**
 * Busca horários disponíveis para um cliente em um determinado dia
 * @param {Number} client_id
 * @param {Date} dia
 * @param {Number} duracaoMinutos
 * @returns {Array} Lista de horários livres (ex: [{inicio, fim}])
 */
async function buscarHorariosDisponiveis(client_id, dia, duracaoMinutos = 60) {
  const inicioDia = new Date(dia);
  inicioDia.setHours(8,0,0,0);
  const fimDia = new Date(dia);
  fimDia.setHours(18,0,0,0);

  // Busca compromissos do dia
  const compromissos = await Compromisso.find({
    client_id,
    data_inicio: { $gte: inicioDia, $lt: fimDia }
  }).sort('data_inicio');

  // Gera slots de 1h
  const slots = [];
  let slotInicio = new Date(inicioDia);
  while (slotInicio < fimDia) {
    let slotFim = new Date(slotInicio.getTime() + duracaoMinutos*60000);
    // Verifica conflito
    const conflito = compromissos.some(c =>
      (slotInicio < c.data_fim && slotFim > c.data_inicio)
    );
    if (!conflito && slotFim <= fimDia) {
      slots.push({ inicio: new Date(slotInicio), fim: new Date(slotFim) });
    }
    slotInicio = new Date(slotInicio.getTime() + duracaoMinutos*60000);
  }
  return slots;
}

/**
 * Agenda um compromisso automaticamente no próximo horário livre
 * @param {Number} client_id
 * @param {String} nome_cliente
 * @param {String} procedimento
 * @param {String} descricao
 * @param {Date} preferenciaData
 * @returns {Object} Compromisso criado ou null
 */
async function agendarAutomatico({ client_id, nome_cliente, procedimento, descricao = '', preferenciaData }) {
  // Busca próximos 7 dias
  for (let i = 0; i < 7; i++) {
    const dia = new Date(preferenciaData);
    dia.setDate(dia.getDate() + i);
    const horarios = await buscarHorariosDisponiveis(client_id, dia);
    if (horarios.length > 0) {
      // Verifica se já existe compromisso igual nesse horário
      const slot = horarios[0];
      const conflito = await Compromisso.findOne({
        client_id,
        data_inicio: slot.inicio,
        data_fim: slot.fim
      });
      if (!conflito) {
        // Monta observação detalhada
        let obs = descricao || '';
        const compromisso = await Compromisso.create({
          client_id,
          nome_cliente,
          procedimento,
          descricao: obs,
          data_inicio: slot.inicio,
          data_fim: slot.fim,
          criado_por: 'ia'
        });
        return compromisso;
      }
    }
  }
  return null;
}

module.exports = {
  buscarHorariosDisponiveis,
  agendarAutomatico
};
