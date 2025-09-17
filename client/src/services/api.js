
import axios from 'axios';

// Base da API:
// - Produção (Vercel): defina REACT_APP_API_BASE (ex.: https://api.seudominio.com)
// - Desenvolvimento: usa proxy do CRA quando vazio
const API_BASE_URL =
  process.env.REACT_APP_API_BASE ||
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:5010' : '');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adiciona o token JWT em todas as requisições, se existir
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const clientAPI = {
  // Criar novo cliente
  createClient: async (clientData) => {
    const response = await api.post('/client', clientData);
    return response.data;
  },

  // Buscar cliente por ID
  getClient: async (clientId) => {
    const response = await api.get(`/client/${clientId}`);
    return response.data;
  },

  // Atualizar cliente
  updateClient: async (clientId, updateData) => {
    const response = await api.put(`/client/${clientId}`, updateData);
    return response.data;
  },

  // Listar todos os clientes
  listClients: async () => {
    const response = await api.get('/client');
    return response.data;
  },

  // Deletar cliente
  deleteClient: async (clientId) => {
    const response = await api.delete(`/client/${clientId}`);
    return response.data;
  },

  // Obter estatísticas do cliente
  getStats: async (clientId) => {
    const response = await api.get(`/client/${clientId}/stats`);
    return response.data;
  },

  // Obter QR Code do WhatsApp para o cliente logado
  getWhatsappQrCode: async (clientId) => {
    const response = await api.get(`/whatsapp/${clientId}/qrcode`);
    return response.data;
  },

  // Testar mensagem
  testMessage: async (clientId, message) => {
    const response = await api.post('/webhook/test', {
      client_id: clientId,
      message
    });
    return response.data;
  },

  // Buscar dados do dashboard do cliente logado
  getDashboard: async (clientId) => {
    const response = await api.get(`/client/${clientId}/stats`);
    return response.data;
  }
};

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Erro com resposta do servidor
      throw new Error(error.response.data.error || 'Erro no servidor');
    } else if (error.request) {
      // Erro de rede
      throw new Error('Erro de conexão com o servidor');
    } else {
      // Erro de configuração
      throw new Error('Erro interno');
    }
  }
);

export default api;
