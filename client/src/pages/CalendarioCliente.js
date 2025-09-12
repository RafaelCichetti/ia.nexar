
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './CalendarioCliente.css';
import './CalendarioClienteOverride.css';
import { confirmCancelAppointment } from '../utils/confirm';

const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

function groupByDay(compromissos) {
  const map = {};
  compromissos.forEach(c => {
    const dia = new Date(c.data_inicio).toISOString().slice(0, 10);
    if (!map[dia]) map[dia] = [];
    map[dia].push(c);
  });
  return map;
}

const CalendarioCliente = () => {
  const [compromissos, setCompromissos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [modalDia, setModalDia] = useState(null);
  const [mesAtual, setMesAtual] = useState(() => {
    const hoje = new Date();
    return { ano: hoje.getFullYear(), mes: hoje.getMonth() };
  });

  const clientId = JSON.parse(localStorage.getItem('user'))?.client_id;

  useEffect(() => {
    if (!clientId) return;
    setLoading(true);
    api.get(`/compromisso/${clientId}`)
      .then(res => setCompromissos(res.data.data))
      .catch(() => setErro('Erro ao carregar compromissos'))
      .finally(() => setLoading(false));
  }, [clientId]);

  const dias = getMonthDays(mesAtual.ano, mesAtual.mes);
  const compromissosPorDia = groupByDay(compromissos);

  function handlePrevMonth() {
    setMesAtual(m => {
      if (m.mes === 0) return { ano: m.ano - 1, mes: 11 };
      return { ano: m.ano, mes: m.mes - 1 };
    });
  }
  function handleNextMonth() {
    setMesAtual(m => {
      if (m.mes === 11) return { ano: m.ano + 1, mes: 0 };
      return { ano: m.ano, mes: m.mes + 1 };
    });
  }

  const [showNovo, setShowNovo] = useState(false);
  const novoPadrao = { nome_cliente: '', procedimento: '', descricao: '', data_inicio: '', data_fim: '', status: 'agendado' };
  const [novo, setNovo] = useState(novoPadrao);
  const [saving, setSaving] = useState(false);

  const handleNovoChange = e => setNovo({ ...novo, [e.target.name]: e.target.value });
  const handleNovoSubmit = async e => {
    e.preventDefault();
    if (!clientId) {
      setErro('Usuário não autenticado. Faça login novamente.');
      return;
    }
    setSaving(true);
    try {
      const body = {
        ...novo,
        client_id: clientId,
        data_inicio: new Date(novo.data_inicio),
        data_fim: new Date(novo.data_fim)
      };
      const res = await api.post('/compromisso', body);
      setCompromissos([...compromissos, res.data.data]);
      setShowNovo(false);
      setNovo(novoPadrao);
    } catch {
      setErro('Erro ao criar compromisso');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="calendario-cliente">
      <div className="agenda-header">
        <button onClick={handlePrevMonth}>&lt;</button>
        <h2>{new Date(mesAtual.ano, mesAtual.mes).toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</h2>
        <button onClick={handleNextMonth}>&gt;</button>
        <button className="btn btn-primary" style={{marginLeft:24}} onClick={() => setShowNovo(true)}>
          + Adicionar Evento
        </button>
      </div>
      {showNovo && (
        <div className="modal-bg" onClick={() => setShowNovo(false)}>
          <div className="modal-detalhes" onClick={e => e.stopPropagation()}>
            <h2>Novo Compromisso</h2>
            <form onSubmit={handleNovoSubmit} className="form-editar-compromisso">
              <label>Cliente:<input name="nome_cliente" value={novo.nome_cliente} onChange={handleNovoChange} required /></label>
              <label>Procedimento:<input name="procedimento" value={novo.procedimento} onChange={handleNovoChange} required /></label>
              <label>Descrição:<input name="descricao" value={novo.descricao} onChange={handleNovoChange} /></label>
              <label>Início:<input name="data_inicio" type="datetime-local" value={novo.data_inicio} onChange={handleNovoChange} required /></label>
              <label>Fim:<input name="data_fim" type="datetime-local" value={novo.data_fim} onChange={handleNovoChange} required /></label>
              <label>Status:
                <select name="status" value={novo.status} onChange={handleNovoChange} required>
                  <option value="agendado">Agendado</option>
                  <option value="concluido">Concluído</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </label>
              <button className="btn btn-primary" type="submit" disabled={saving}>Salvar</button>
              <button className="btn btn-secondary" type="button" onClick={() => setShowNovo(false)}>Cancelar</button>
            </form>
          </div>
        </div>
      )}
      {erro && <div className="erro">{erro}</div>}
      {loading ? <p>Carregando...</p> : (
        <>
          <div className="agenda-grid agenda-dias-semana">
            {diasSemana.map(dia => <div key={dia} className="agenda-cell agenda-dia-semana">{dia}</div>)}
          </div>
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
        </>
      )}
      {modalDia && (
        <div className="modal-bg" onClick={() => setModalDia(null)}>
          <div
            className="modal-detalhes"
            onClick={e => e.stopPropagation()}
            ref={el => { if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50); }}
          >
            <h2>Compromissos em {modalDia.dia.toLocaleDateString()}</h2>
            {modalDia.eventos.length === 0 ? <p>Nenhum compromisso.</p> : (
              <ul className="agenda-lista-eventos">
                {modalDia.eventos.map(ev => (
                  <li key={ev._id} className={`evento-item status-${ev.status}`}>
                    <div style={{fontWeight:700, fontSize:'1.08rem', color:'#00e676'}}>{ev.procedimento}</div>
                    <div style={{fontWeight:500, color:'#b2ff59', marginBottom:2}}>{ev.nome_cliente}</div>
                    <div style={{fontSize:'0.98rem', color:'#bdbdbd', marginBottom:4}}>{ev.descricao}</div>
                    <div style={{fontSize:'0.95rem', color:'#00bfae'}}>
                      {new Date(ev.data_inicio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(ev.data_fim).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <span style={{fontSize:'0.93rem', color:'#fff'}}>Status: {ev.status}</span>
                    <div style={{marginTop:8}}>
                      <button className="btn btn-sm" onClick={async () => {
                        // Editar compromisso: abre modal de novo preenchido
                        setShowNovo(true);
                        setNovo({
                          ...ev,
                          data_inicio: new Date(ev.data_inicio).toISOString().slice(0,16),
                          data_fim: new Date(ev.data_fim).toISOString().slice(0,16)
                        });
                      }}>Editar</button>
                      <button className="btn btn-sm btn-danger" style={{marginLeft:8}} onClick={async () => {
                        const ok = await confirmCancelAppointment('O compromisso será removido da agenda.');
                        if(!ok) return;
                        try {
                          await api.delete(`/compromisso/${ev._id}`);
                          setCompromissos(cs => cs.filter(c => c._id !== ev._id));
                          setModalDia(m => ({...m, eventos: m.eventos.filter(e => e._id !== ev._id)}));
                        } catch {
                          setErro('Erro ao cancelar compromisso');
                        }
                      }}>Cancelar</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <button className="btn btn-secondary" onClick={() => setModalDia(null)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarioCliente;
