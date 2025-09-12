import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaPlus, 
  FaUsers, 
  FaEdit, 
  FaTrash, 
  FaRobot,
  FaComments,
  FaCheck,
  FaTimes,
  FaSearch
} from 'react-icons/fa';
import { clientAPI } from '../services/api';
import './ClientList.css';
import { confirmDeleteEntity } from '../utils/confirm';

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newClient, setNewClient] = useState({
    name: '',
    phone_number: '',
    cnpj_cpf: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    email: '',
    senha: ''
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await clientAPI.listClients();
      setClients(response.data || []);
    } catch (err) {
      setError(err.message);
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    
    try {
      await clientAPI.createClient(newClient);
      toast.success('Cliente criado com sucesso!');
      setShowCreateModal(false);
      setNewClient({
        name: '',
        phone_number: '',
        cnpj_cpf: '',
        endereco: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
        email: '',
        senha: ''
      });
      loadClients();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteClient = async (clientId) => {
    const ok = await confirmDeleteEntity('cliente');
    if (!ok) return;

    try {
      await clientAPI.deleteClient(clientId);
  toast.success('Cliente excluído com sucesso!');
      loadClients();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleToggleActive = async (clientId, currentStatus) => {
    try {
      await clientAPI.updateClient(clientId, { active: !currentStatus });
      toast.success(`Cliente ${!currentStatus ? 'ativado' : 'desativado'} com sucesso!`);
      loadClients();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.client_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="client-list">
        <div className="loading">
          <FaUsers className="loading-icon" />
          <p>Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="client-list">
      <div className="page-header">
        <div className="header-content">
          <h1>Gerenciar Clientes</h1>
          <p>Cadastre e gerencie os clientes da sua plataforma</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <FaPlus /> Novo Cliente
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <FaTimes className="error-icon" />
          <span>{error}</span>
          <button className="btn btn-sm btn-primary" onClick={loadClients}>
            Tentar Novamente
          </button>
        </div>
      )}

      <div className="client-controls">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por nome ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="client-count">
          {filteredClients.length} de {clients.length} clientes
        </div>
      </div>

      {filteredClients.length === 0 ? (
        <div className="empty-state">
          <FaUsers className="empty-icon" />
          {searchTerm ? (
            <>
              <h3>Nenhum cliente encontrado</h3>
              <p>Não há clientes que correspondam à sua busca "{searchTerm}"</p>
            </>
          ) : (
            <>
              <h3>Nenhum cliente cadastrado</h3>
              <p>Comece criando seu primeiro cliente para usar a plataforma</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowCreateModal(true)}
              >
                <FaPlus /> Criar Primeiro Cliente
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="clients-grid">
          {filteredClients.map((client) => (
            <div key={client._id} className="client-card">
              <div className="client-header">
                <div className="client-title">
                  <h3>{client.name}</h3>
                  <span className="client-id">ID: {client.client_id}</span>
                </div>
                <div className={`status-badge ${client.active ? 'active' : 'inactive'}`}>
                  {client.active ? <FaCheck /> : <FaTimes />}
                  {client.active ? 'Ativo' : 'Inativo'}
                </div>
              </div>

              <div className="client-stats">
                <div className="stat-item">
                  <FaComments className="stat-icon" />
                  <div className="stat-info">
                    <span className="stat-number">{client.stats?.total_messages || 0}</span>
                    <span className="stat-label">Mensagens</span>
                  </div>
                </div>
                <div className="stat-item">
                  <FaRobot className="stat-icon" />
                  <div className="stat-info">
                    <span className="stat-number">{client.ia_config?.length || 0}</span>
                    <span className="stat-label">Regras IA</span>
                  </div>
                </div>
              </div>

              <div className="client-info">
                <p><strong>Telefone:</strong> {client.phone_number}</p>
                <p><strong>Criado em:</strong> {new Date(client.created_at).toLocaleDateString('pt-BR')}</p>
                {client.stats?.last_message && (
                  <p><strong>Última mensagem:</strong> {new Date(client.stats.last_message).toLocaleDateString('pt-BR')}</p>
                )}
              </div>

              <div className="client-actions">
                <Link 
                  to={`/client/${client.client_id}`}
                  className="btn btn-sm btn-primary"
                >
                  <FaEdit /> Ver Detalhes
                </Link>
                <Link 
                  to={`/client/${client.client_id}/ia`}
                  className="btn btn-sm btn-secondary"
                >
                  <FaRobot /> Configurar IA
                </Link>
                <button
                  className={`btn btn-sm ${client.active ? 'btn-warning' : 'btn-success'}`}
                  onClick={() => handleToggleActive(client.client_id, client.active)}
                >
                  {client.active ? 'Desativar' : 'Ativar'}
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDeleteClient(client.client_id)}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Criação */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Criar Novo Cliente</h2>
              <button 
                className="modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleCreateClient} className="modal-body">
              {/* <div className="form-group">
                <label>ID do Cliente *</label>
                <input
                  type="text"
                  value={newClient.client_id}
                  onChange={(e) => setNewClient({...newClient, client_id: e.target.value})}
                  placeholder="Ex: empresa123"
                  required
                  className="form-control"
                />
                <small>Identificador único do cliente (sem espaços)</small>
              </div> */}


              <div className="form-group">
                <label>Nome da Empresa *</label>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                  placeholder="Ex: Minha Empresa Ltda"
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>E-mail do Usuário *</label>
                <input
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  placeholder="Ex: usuario@empresa.com"
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Senha de Acesso *</label>
                <input
                  type="password"
                  value={newClient.senha}
                  onChange={(e) => setNewClient({ ...newClient, senha: e.target.value })}
                  placeholder="Digite uma senha segura"
                  required
                  className="form-control"
                  autoComplete="new-password"
                />
                <small>A senha será usada pelo usuário principal para acessar o sistema. Ele poderá alterá-la depois.</small>
              </div>

              <div className="form-group">
                <label>Número do WhatsApp Business *</label>
                <input
                  type="text"
                  value={newClient.phone_number}
                  onChange={(e) => setNewClient({...newClient, phone_number: e.target.value})}
                  placeholder="Ex: 5511999999999"
                  required
                  className="form-control"
                />
                <small>Phone Number ID do WhatsApp Cloud API</small>
              </div>

              <div className="form-group">
                <label>CNPJ ou CPF *</label>
                <input
                  type="text"
                  value={newClient.cnpj_cpf}
                  onChange={(e) => setNewClient({...newClient, cnpj_cpf: e.target.value})}
                  placeholder="Ex: 00.000.000/0000-00 ou 000.000.000-00"
                  required
                  className="form-control"
                />
                <small>Insira o CNPJ ou CPF do cliente</small>
              </div>

              <div className="form-group">
                <label>Endereço</label>
                <input
                  type="text"
                  value={newClient.endereco}
                  onChange={(e) => setNewClient({...newClient, endereco: e.target.value})}
                  placeholder="Ex: Rua das Flores"
                  className="form-control"
                />
              </div>
              <div className="form-row">
                <div className="form-group col-4">
                  <label>Número</label>
                  <input
                    type="text"
                    value={newClient.numero}
                    onChange={(e) => setNewClient({...newClient, numero: e.target.value})}
                    placeholder="Ex: 123"
                    className="form-control"
                  />
                </div>
                <div className="form-group col-8">
                  <label>Complemento</label>
                  <input
                    type="text"
                    value={newClient.complemento}
                    onChange={(e) => setNewClient({...newClient, complemento: e.target.value})}
                    placeholder="Ex: Sala 1, Fundos, etc."
                    className="form-control"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group col-6">
                  <label>Bairro</label>
                  <input
                    type="text"
                    value={newClient.bairro}
                    onChange={(e) => setNewClient({...newClient, bairro: e.target.value})}
                    placeholder="Ex: Centro"
                    className="form-control"
                  />
                </div>
                <div className="form-group col-6">
                  <label>Cidade</label>
                  <input
                    type="text"
                    value={newClient.cidade}
                    onChange={(e) => setNewClient({...newClient, cidade: e.target.value})}
                    placeholder="Ex: São Paulo"
                    className="form-control"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group col-6">
                  <label>Estado</label>
                  <input
                    type="text"
                    value={newClient.estado}
                    onChange={(e) => setNewClient({...newClient, estado: e.target.value})}
                    placeholder="Ex: SP"
                    className="form-control"
                  />
                </div>
                <div className="form-group col-6">
                  <label>CEP</label>
                  <input
                    type="text"
                    value={newClient.cep}
                    onChange={(e) => setNewClient({...newClient, cep: e.target.value})}
                    placeholder="Ex: 01001-000"
                    className="form-control"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  <FaPlus /> Criar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientList;
