
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './AgendaCliente.css';
import { confirmCancelAppointment } from '../utils/confirm';

// Utilitário para gerar todos os dias do mês
function diasDoMes(ano, mes) {
  const ultimoDia = new Date(ano, mes + 1, 0).getDate();
  return Array.from({ length: ultimoDia }, (_, i) => new Date(ano, mes, i + 1));
}

// Agrupa compromissos por dia (yyyy-mm-dd)
function agruparPorDia(compromissos) {
  return compromissos.reduce((acc, c) => {
    const dia = new Date(c.data_inicio).toISOString().slice(0, 10);
    if (!acc[dia]) acc[dia] = [];
    acc[dia].push(c);
    return acc;
  }, {});
}

const AgendaCliente = () => {
  const [compromissos, setCompromissos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [modalDia, setModalDia] = useState(null);
  const [mesAtual, setMesAtual] = useState(() => {
    const hoje = new Date();
    return { ano: hoje.getFullYear(), mes: hoje.getMonth() };
  });
  const [modalNovo, setModalNovo] = useState(false);
  const [novoCompromisso, setNovoCompromisso] = useState({ procedimento: '', descricao: '', data: '', hora: '' });
  const [salvando, setSalvando] = useState(false);
  const [editando, setEditando] = useState(null);

  const clientId = JSON.parse(localStorage.getItem('user'))?.client_id;

  // Carrega compromissos do backend
  const carregarCompromissos = () => {
    if (!clientId) return;
    setCarregando(true);
    setErro(null);
    api.get(`/compromisso/${clientId}`)
      .then(res => setCompromissos(res.data.data))
      .catch(() => setErro('Erro ao carregar compromissos'))
      .finally(() => setCarregando(false));
  };

  useEffect(() => {
    carregarCompromissos();
    // eslint-disable-next-line
  }, [clientId, mesAtual]);

  const dias = diasDoMes(mesAtual.ano, mesAtual.mes);
  const compromissosPorDia = agruparPorDia(compromissos);

  function irParaMesAnterior() {
    setMesAtual(m => m.mes === 0 ? { ano: m.ano - 1, mes: 11 } : { ano: m.ano, mes: m.mes - 1 });
  }
  function irParaProximoMes() {
    setMesAtual(m => m.mes === 11 ? { ano: m.ano + 1, mes: 0 } : { ano: m.ano, mes: m.mes + 1 });
  }

  // Criar novo compromisso
  async function criarCompromisso(e) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);
    try {
      const data_inicio = new Date(`${novoCompromisso.data}T${novoCompromisso.hora}`);
      const data_fim = new Date(data_inicio.getTime() + 60*60000);
      const payload = {
        client_id: clientId,
        nome_cliente: JSON.parse(localStorage.getItem('user'))?.name || 'Cliente',
        procedimento: novoCompromisso.procedimento,
        descricao: novoCompromisso.descricao,
        data_inicio,
        data_fim
      };
      await api.post('/compromisso', payload);
      setModalNovo(false);
      setNovoCompromisso({ procedimento: '', descricao: '', data: '', hora: '' });
      carregarCompromissos();
    } catch (err) {
      setErro('Erro ao criar compromisso');
    } finally {
      setSalvando(false);
    }
  }

  // Cancelar compromisso
  async function cancelarCompromisso(id) {
    const ok = await confirmCancelAppointment('O compromisso será removido da agenda.');
    if (!ok) return;
    setSalvando(true);
    try {
      await api.delete(`/compromisso/${id}`);
      carregarCompromissos();
      setModalDia(null);
    } catch {
      setErro('Erro ao cancelar compromisso');
    } finally {
      setSalvando(false);
    }
  }

  // Editar compromisso (abre modal)
  function abrirEditar(ev) {
    setEditando(ev);
    setNovoCompromisso({
      procedimento: ev.procedimento,
      descricao: ev.descricao,
      data: new Date(ev.data_inicio).toISOString().slice(0,10),
      hora: new Date(ev.data_inicio).toTimeString().slice(0,5)
    });
    setModalNovo(true);
  }

  // Salvar edição
  async function salvarEdicao(e) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);
    try {
      const data_inicio = new Date(`${novoCompromisso.data}T${novoCompromisso.hora}`);
      const data_fim = new Date(data_inicio.getTime() + 60*60000);
      const payload = {
        procedimento: novoCompromisso.procedimento,
        descricao: novoCompromisso.descricao,
        data_inicio,
        data_fim
      };
      await api.put(`/compromisso/${editando._id}`, payload);
      setModalNovo(false);
      setEditando(null);
      setNovoCompromisso({ procedimento: '', descricao: '', data: '', hora: '' });
      carregarCompromissos();
    } catch {
      setErro('Erro ao editar compromisso');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="agenda-cliente">
      <div className="agenda-header">
        <button onClick={irParaMesAnterior}>&lt;</button>
        <h2>{new Date(mesAtual.ano, mesAtual.mes).toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</h2>
        <button onClick={irParaProximoMes}>&gt;</button>
      </div>
      {erro && <div className="erro">{erro}</div>}
      {carregando ? <p>Carregando...</p> : (
        <div className="agenda-grid">
          {[...Array(new Date(mesAtual.ano, mesAtual.mes, 1).getDay()).keys()].map(i => <div key={'empty'+i} className="agenda-cell empty"></div>)}
          {dias.map(dia => {
            const diaStr = dia.toISOString().slice(0, 10);
            const eventos = compromissosPorDia[diaStr] || [];
            return (
              <div key={diaStr} className={`agenda-cell ${eventos.length ? 'tem-evento' : ''}`} onClick={() => setModalDia({ dia, eventos })}>
                <div className="agenda-dia">{dia.getDate()}</div>
                {eventos.length > 0 && <div className="agenda-eventos-count">{eventos.length} evento(s)</div>}
              </div>
            );
          })}
        </div>
      )}
      {modalDia && (
        <div className="modal-bg" onClick={() => setModalDia(null)}>
          <div className="modal-detalhes" onClick={e => e.stopPropagation()}>
            <h2>Compromissos em {modalDia.dia.toLocaleDateString()}</h2>
            {modalDia.eventos.length === 0 ? <p>Nenhum compromisso.</p> : (
              <ul className="agenda-lista-eventos">
                {modalDia.eventos.map(ev => (
                  <li key={ev._id} className={`evento-item status-${ev.status}`}>
                    <b>{ev.procedimento}</b> - {ev.nome_cliente}<br/>
                    <span>{new Date(ev.data_inicio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(ev.data_fim).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span><br/>
                    <span>Status: {ev.status}</span><br/>
                    <button className="btn btn-sm" onClick={() => abrirEditar(ev)}>Editar</button>
                    <button className="btn btn-sm btn-danger" onClick={() => cancelarCompromisso(ev._id)}>Cancelar</button>
                  </li>
                ))}
              </ul>
            )}
            <button className="btn btn-secondary" onClick={() => setModalDia(null)}>Fechar</button>
            <button className="btn btn-primary" onClick={() => { setModalNovo(true); setEditando(null); setNovoCompromisso({ procedimento: '', descricao: '', data: modalDia.dia.toISOString().slice(0,10), hora: '08:00' }); }}>Novo compromisso</button>
          </div>
        </div>
      )}

      {/* Modal de novo/editar compromisso */}
      {modalNovo && (
        <div className="modal-bg" onClick={() => { setModalNovo(false); setEditando(null); }}>
          <div className="modal-detalhes" onClick={e => e.stopPropagation()}>
            <h2>{editando ? 'Editar compromisso' : 'Novo compromisso'}</h2>
            <form onSubmit={editando ? salvarEdicao : criarCompromisso} className="form-compromisso">
              <label>
                Procedimento:<br/>
                <input type="text" required value={novoCompromisso.procedimento} onChange={e => setNovoCompromisso(n => ({ ...n, procedimento: e.target.value }))} />
              </label><br/>
              <label>
                Descrição:<br/>
                <input type="text" value={novoCompromisso.descricao} onChange={e => setNovoCompromisso(n => ({ ...n, descricao: e.target.value }))} />
              </label><br/>
              <label>
                Data:<br/>
                <input type="date" required value={novoCompromisso.data} onChange={e => setNovoCompromisso(n => ({ ...n, data: e.target.value }))} />
              </label><br/>
              <label>
                Hora:<br/>
                <input type="time" required value={novoCompromisso.hora} onChange={e => setNovoCompromisso(n => ({ ...n, hora: e.target.value }))} />
              </label><br/>
              <button className="btn btn-primary" type="submit" disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar'}</button>
              <button className="btn btn-secondary" type="button" onClick={() => { setModalNovo(false); setEditando(null); }}>Cancelar</button>
            </form>
            {erro && <div className="erro">{erro}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendaCliente;
