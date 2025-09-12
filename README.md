# 🤖 Sistema de IA Conversacional para WhatsApp

> **Sistema completo de atendimento inteligente via WhatsApp usando OpenAI ChatGPT**

## 📋 Visão Geral

Este é um sistema SaaS completo que permite que empresas integrem IA conversacional real (ChatGPT) ao WhatsApp Business para atendimento automatizado e personalizado.

### ✨ Características Principais

- **🧠 IA Real**: Integração com OpenAI ChatGPT (não apenas keywords)
- **💬 WhatsApp Business**: Webhook oficial da Meta
- **🎯 Personalização**: Cada cliente pode configurar personalidade e instruções da IA
- **📊 Analytics**: Logs completos de conversas, custos e performance
- **🔄 Contexto**: Memória de conversa para interações naturais
- **💰 Gestão de Custos**: Tracking automático de tokens e custos da OpenAI

## 🏗️ Arquitetura do Sistema

### Backend (Node.js + Express)
- **API REST** para gerenciamento de clientes
- **Webhook WhatsApp** para receber/enviar mensagens
- **Integração OpenAI** com gerenciamento de contexto
- **MongoDB** para persistência de dados
- **Logs de conversa** para analytics

### Frontend (React)
- **Dashboard administrativo** para gerenciar clientes
- **Configuração de IA** por cliente
- **Analytics em tempo real**
- **Demonstração interativa**

### Integração WhatsApp
- **WhatsApp Cloud API** oficial
- **Webhook verificado** pela Meta
- **Envio/recebimento** de mensagens automático

## 🚀 Instalação e Configuração

### 1. Pré-requisitos
```bash
Node.js 18+ 
MongoDB 4.4+
NPM ou Yarn
```

### 2. Configuração do Projeto
```bash
# Instalar dependências
npm install

# Inicializar dados
node scripts/updateClientData.js
```

### 3. Configuração do .env
```env
# OpenAI (OBRIGATÓRIO para IA real)
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-3.5-turbo

# MongoDB
MONGODB_URI=mongodb://localhost:27017/saas-ia-whatsapp

# WhatsApp Business (configurar por cliente)
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
WHATSAPP_VERIFY_TOKEN=your_webhook_verify_token
```

### 4. Executar o Sistema
```bash
# Iniciar backend
npm start

# Acessar demonstração
http://localhost:3000/demo.html
```

## 🧪 Testando o Sistema

### Demonstração Interativa
Acesse: `http://localhost:3000/demo.html`

### Teste via API
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:3000/webhook/test" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"client_id": "clinica_dr_silva", "message": "Olá!"}'
```

### Scripts de Teste
```bash
# Testar integração OpenAI
node scripts/testOpenAI.js

# Atualizar dados dos clientes
node scripts/updateClientData.js
```

## 📊 Como Funciona

### 1. Recebimento da Mensagem
- WhatsApp envia webhook para `/webhook`
- Sistema identifica cliente pelo número/token
- Mensagem é processada pela IA

### 2. Processamento da IA
- Prompt personalizado é montado com:
  - Informações do negócio
  - Instruções específicas
  - Histórico da conversa
- Enviado para OpenAI ChatGPT
- Resposta é gerada contextualmente

### 3. Envio da Resposta
- Resposta da IA é enviada via WhatsApp
- Log da conversa é salvo (analytics)
- Estatísticas são atualizadas

## 🎯 Personalização da IA

### Configuração por Cliente
Cada cliente pode ter:
- **business_info**: Contexto sobre produtos/serviços
- **ai_instructions**: Como a IA deve se comportar
- **ai_personality**: Tom, estilo e linguagem

### Exemplo de Configuração
```javascript
{
  business_info: `
    Restaurante Sabor & Arte
    - Culinária brasileira contemporânea
    - Horário: terça a domingo, 11h30 às 23h
    - Delivery disponível
  `,
  
  ai_instructions: `
    Você é o assistente virtual do Restaurante.
    - Seja sempre cordial e acolhedor
    - Para delivery, colete: nome, endereço, telefone
    - Mantenha tom natural e conversacional
  `
}
```

## 📈 Analytics Disponíveis

### Métricas por Cliente
- Volume de mensagens
- Custos de IA (tokens/dólares)
- Tempo de resposta médio
- Taxa de sucesso das interações

### Logs Detalhados
- Cada conversa é registrada
- Tracking de tokens e custos
- Análise de performance
- Histórico completo

## 🔧 Estrutura de Arquivos

```
src/
├── models/          # Modelos MongoDB
│   ├── Client.js    # Dados do cliente
│   └── ConversationLog.js  # Logs de conversa
├── services/        # Lógica de negócio
│   ├── IAEngine.js  # Integração OpenAI
│   └── WhatsAppService.js  # API WhatsApp
├── routes/          # Endpoints da API
│   ├── webhook.js   # Webhook WhatsApp
│   └── clients.js   # CRUD clientes
└── database/        # Configuração MongoDB

scripts/
├── testOpenAI.js    # Teste da IA
└── updateClientData.js  # Atualizar dados

public/
└── demo.html        # Demonstração interativa
```

## 🚨 Troubleshooting

### ❌ API Key OpenAI inválida
1. Acesse [OpenAI Platform](https://platform.openai.com/api-keys)
2. Crie uma API Key
3. Substitua no arquivo `.env`

### ❌ MongoDB não conecta
```bash
# Verificar se está rodando
mongod --version

# Instalar MongoDB se necessário
# Windows: MongoDB Community Server
# Mac: brew install mongodb/brew/mongodb-community
# Ubuntu: apt install mongodb
```

### ❌ Porta 3000 ocupada
```bash
# Parar processo na porta 3000
npx kill-port 3000

# Ou alterar porta no .env
PORT=3001
```

## 💰 Custos Estimados

### OpenAI GPT-3.5-turbo
- **$0.002 por 1K tokens**
- **Mensagem típica**: 50-200 tokens
- **Custo por mensagem**: $0.0001 - $0.0004
- **1000 mensagens/dia**: ~$0.10 - $0.40

### Modo Demo
- **Sem custos da OpenAI**
- **Respostas simuladas** inteligentes
- **Funcionalidade completa** para testes

## 🔄 Próximos Passos

### Para Produção
1. **Configurar OpenAI API Key** real
2. **Configurar WhatsApp Business** API
3. **Deploy em servidor** com HTTPS
4. **Configurar domínio** para webhook
5. **Monitoramento** e logs

### Melhorias Futuras
- Múltiplos modelos de IA
- Interface administrativa completa
- Integração com CRM
- Análise de sentimento
- Suporte a múltiplas linguagens

---

## 🏆 Diferencial

### ❌ Chatbots Tradicionais
- Respostas pré-programadas
- Keywords limitadas
- Sem contexto
- Experiência robótica

### ✅ Nossa IA Conversacional
- **Compreensão natural** da linguagem
- **Respostas contextuais** inteligentes
- **Personalização total** por negócio
- **Integração real** com WhatsApp Business

---

*Sistema desenvolvido com foco em **qualidade**, **escalabilidade** e **facilidade de uso**. Transforme o atendimento ao cliente com IA conversacional real!* 🚀
