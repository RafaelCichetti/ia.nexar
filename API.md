# 📚 Documentação da API - SaaS IA WhatsApp

Base URL: `http://localhost:3000`

## 🔐 Autenticação

Atualmente a API não requer autenticação, mas em produção você deve implementar:
- JWT tokens
- API keys
- Rate limiting

---

## 📋 Endpoints

### 🏠 Status da API

#### GET /
Retorna informações básicas da API

**Response:**
```json
{
  "message": "🤖 SaaS IA WhatsApp API está funcionando!",
  "version": "1.0.0",
  "endpoints": {
    "webhook": "/webhook",
    "client": "/client/:id"
  }
}
```

---

## 👥 Gerenciamento de Clientes

### POST /client
Criar um novo cliente

**Body:**
```json
{
  "client_id": "empresa123",
  "name": "Minha Empresa Ltda",
  "phone_number": "5511999999999",
  "whatsapp_token": "seu_token_whatsapp",
  "verify_token": "seu_verify_token",
  "default_response": "Desculpe, não entendi. Pode repetir?"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Cliente criado com sucesso",
  "data": {
    "client_id": "empresa123",
    "name": "Minha Empresa Ltda",
    "phone_number": "5511999999999",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### GET /client/:id
Buscar cliente por ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "client_id": "empresa123",
    "name": "Minha Empresa Ltda",
    "phone_number": "5511999999999",
    "ia_config": [
      {
        "_id": "config_id_1",
        "keyword": "horário",
        "response": "Atendemos das 8h às 18h!",
        "created_at": "2024-01-15T10:35:00.000Z"
      }
    ],
    "default_response": "Desculpe, não entendi. Pode repetir?",
    "active": true,
    "stats": {
      "total_messages": 150,
      "ai_responses": 120,
      "default_responses": 30,
      "last_message": "2024-01-15T15:45:00.000Z"
    },
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T15:45:00.000Z"
  }
}
```

### PUT /client/:id
Atualizar cliente

**Body:**
```json
{
  "name": "Novo Nome da Empresa",
  "default_response": "Nova resposta padrão",
  "active": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Cliente atualizado com sucesso",
  "data": {
    // dados atualizados do cliente
  }
}
```

### DELETE /client/:id
Deletar cliente

**Response (200):**
```json
{
  "success": true,
  "message": "Cliente deletado com sucesso"
}
```

### GET /client
Listar todos os clientes

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "client_id": "empresa123",
      "name": "Minha Empresa Ltda",
      // ... outros campos (sem tokens sensíveis)
    }
  ],
  "total": 1
}
```

### GET /client/:id/stats
Obter estatísticas do cliente

**Response (200):**
```json
{
  "success": true,
  "data": {
    "client_id": "empresa123",
    "name": "Minha Empresa Ltda",
    "stats": {
      "total_messages": 150,
      "ai_responses": 120,
      "default_responses": 30,
      "last_message": "2024-01-15T15:45:00.000Z"
    },
    "ia_config_count": 5,
    "active": true,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T15:45:00.000Z"
  }
}
```

---

## 🤖 Configurações de IA

### POST /client/:id/ia
Adicionar configuração de IA

**Body:**
```json
{
  "keyword": "horário",
  "response": "Nosso horário de funcionamento é das 8h às 18h, de segunda a sexta-feira."
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Configuração de IA adicionada com sucesso"
}
```

### DELETE /client/:id/ia/:configId
Remover configuração de IA

**Response (200):**
```json
{
  "success": true,
  "message": "Configuração de IA removida com sucesso"
}
```

---

## 📱 Webhook do WhatsApp

### GET /webhook
Verificação do webhook (usado pelo WhatsApp)

**Query Parameters:**
- `hub.mode`: "subscribe"
- `hub.verify_token`: token de verificação
- `hub.challenge`: challenge do WhatsApp

**Response:** Retorna o challenge se a verificação for bem-sucedida

### POST /webhook
Receber mensagens do WhatsApp

**Body:** Payload do WhatsApp Cloud API
```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "entry_id",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "15550559999",
              "phone_number_id": "123456789"
            },
            "contacts": [
              {
                "profile": {
                  "name": "João Silva"
                },
                "wa_id": "5511999999999"
              }
            ],
            "messages": [
              {
                "from": "5511999999999",
                "id": "wamid.xxx",
                "timestamp": "1641024000",
                "text": {
                  "body": "Qual o horário de funcionamento?"
                },
                "type": "text"
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

**Response (200):** Status 200 (sempre, mesmo em caso de erro para evitar reenvios)

### POST /webhook/test
Testar mensagem (desenvolvimento)

**Body:**
```json
{
  "client_id": "empresa123",
  "message": "Qual o horário de funcionamento?"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "original_message": "Qual o horário de funcionamento?",
    "response": "Nosso horário de funcionamento é das 8h às 18h!",
    "confidence": 0.9,
    "matched_keyword": "horário",
    "is_default": false
  }
}
```

### GET /webhook/status
Status do webhook

**Response (200):**
```json
{
  "status": "ativo",
  "timestamp": "2024-01-15T15:45:00.000Z",
  "message": "Webhook do WhatsApp funcionando normalmente",
  "endpoints": {
    "verify": "GET /webhook",
    "receive": "POST /webhook",
    "test": "POST /webhook/test"
  }
}
```

---

## ❌ Códigos de Erro

### 400 - Bad Request
```json
{
  "error": "Campos obrigatórios: client_id, name, phone_number"
}
```

### 404 - Not Found
```json
{
  "error": "Cliente não encontrado"
}
```

### 500 - Internal Server Error
```json
{
  "error": "Erro interno do servidor"
}
```

---

## 🔄 Fluxo Completo de Mensagem

1. **Usuário envia mensagem** via WhatsApp
2. **WhatsApp Cloud API** faz POST para `/webhook`
3. **Sistema processa** a mensagem:
   - Identifica o cliente pelo `phone_number_id`
   - Executa a IA para encontrar resposta
   - Atualiza estatísticas
4. **Sistema envia resposta** via WhatsApp Cloud API
5. **Usuário recebe** a resposta automaticamente

---

## 🧪 Testando a API

### Usando curl

```bash
# Criar cliente
curl -X POST http://localhost:3000/client \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "teste123",
    "name": "Empresa Teste",
    "phone_number": "123456789",
    "whatsapp_token": "token_teste",
    "verify_token": "verify_teste"
  }'

# Buscar cliente
curl http://localhost:3000/client/teste123

# Adicionar configuração IA
curl -X POST http://localhost:3000/client/teste123/ia \
  -H "Content-Type: application/json" \
  -d '{
    "keyword": "teste",
    "response": "Esta é uma resposta de teste!"
  }'

# Testar mensagem
curl -X POST http://localhost:3000/webhook/test \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "teste123",
    "message": "mensagem de teste"
  }'
```

### Usando Postman

1. Importe a collection (se disponível)
2. Configure a base URL: `http://localhost:3000`
3. Teste os endpoints seguindo a documentação

---

## 🚀 Integração Frontend

O frontend React consome esta API através do arquivo `src/services/api.js`:

```javascript
import { clientAPI } from '../services/api';

// Criar cliente
const response = await clientAPI.createClient(clientData);

// Buscar cliente  
const client = await clientAPI.getClient(clientId);

// Testar mensagem
const result = await clientAPI.testMessage(clientId, message);
```

---

## 📊 Monitoramento

- **Logs**: Verifique o console do servidor para logs detalhados
- **Estatísticas**: Use `/client/:id/stats` para monitorar uso
- **Health Check**: Use `GET /` para verificar se a API está ativa
- **Webhook Status**: Use `/webhook/status` para verificar o webhook

---

**💡 Dica:** Use o painel web em http://localhost:3001 para uma interface mais amigável!
