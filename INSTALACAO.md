# 🚀 Guia de Instalação - SaaS IA WhatsApp

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 16 ou superior) - [Download aqui](https://nodejs.org/)
- **MongoDB** (versão 4.4 ou superior) - [Download aqui](https://www.mongodb.com/try/download/community)
- **Git** (opcional) - [Download aqui](https://git-scm.com/)

## Passo 1: Configuração do Node.js

Se você ainda não tem o Node.js instalado:

1. Acesse https://nodejs.org/
2. Baixe a versão LTS (recomendada)
3. Execute o instalador e siga as instruções
4. Verifique a instalação abrindo o terminal e executando:
   ```bash
   node --version
   npm --version
   ```

## Passo 2: Configuração do MongoDB

### Opção A: MongoDB Local

1. Baixe e instale o MongoDB Community Server
2. Inicie o serviço do MongoDB
3. O MongoDB ficará disponível em `mongodb://localhost:27017`

### Opção B: MongoDB Atlas (Cloud)

1. Acesse https://www.mongodb.com/atlas
2. Crie uma conta gratuita
3. Crie um cluster
4. Obtenha a string de conexão

## Passo 3: Instalação do Projeto

### 3.1 Abrir o projeto no VS Code

1. Abra o VS Code
2. Use `File > Open Folder` para abrir a pasta `c:\teste de ia nexar`

### 3.2 Instalar dependências do Backend

```bash
# No terminal do VS Code (Ctrl+Shift+`)
npm install
```

### 3.3 Instalar dependências do Frontend

```bash
# Navegar para a pasta do cliente
cd client

# Instalar dependências
npm install

# Voltar para a raiz
cd ..
```

## Passo 4: Configuração do Ambiente

### 4.1 Configurar variáveis de ambiente

1. Copie o arquivo de exemplo:
   ```bash
   copy .env.example .env
   ```

2. Edite o arquivo `.env` com suas configurações:
   ```env
   # Configurações do Servidor
   PORT=3000
   NODE_ENV=development

   # Configurações do MongoDB
   MONGODB_URI=mongodb://localhost:27017/saas-ia-whatsapp

   # Configurações do WhatsApp (configurar depois)
   WHATSAPP_ACCESS_TOKEN=seu_token_aqui
   WHATSAPP_VERIFY_TOKEN=seu_verify_token_aqui
   WHATSAPP_PHONE_NUMBER_ID=seu_phone_number_id_aqui
   ```

## Passo 5: Configuração do WhatsApp (Opcional para desenvolvimento)

Para usar com WhatsApp real, você precisará:

### 5.1 Criar App no Meta for Developers

1. Acesse https://developers.facebook.com/
2. Crie um novo app
3. Adicione o produto "WhatsApp"
4. Configure o webhook apontando para sua URL + `/webhook`

### 5.2 Obter tokens necessários

- **Access Token**: Token de acesso à API do WhatsApp
- **Verify Token**: Token para verificação do webhook
- **Phone Number ID**: ID do número do WhatsApp Business

## Passo 6: Executar o Sistema

### 6.1 Iniciar o Backend

```bash
# Terminal 1
npm run dev
```

O backend estará disponível em: http://localhost:3000

### 6.2 Iniciar o Frontend

```bash
# Terminal 2 (novo terminal)
npm run client
```

O frontend estará disponível em: http://localhost:3001

## Passo 7: Teste da Instalação

1. Acesse http://localhost:3001 no navegador
2. Você deve ver o dashboard da aplicação
3. Teste criando um novo cliente
4. Configure algumas regras de IA
5. Use o chat de teste para validar

## 🔧 Comandos Úteis

```bash
# Instalar dependências
npm install
npm run client:install

# Executar em desenvolvimento
npm run dev          # Backend apenas
npm run client       # Frontend apenas
npm start            # Backend em produção

# Outros comandos
npm run build        # Build do frontend
npm test            # Executar testes
```

## 📊 Estrutura de URLs

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **Webhook WhatsApp**: http://localhost:3000/webhook
- **API Docs**: http://localhost:3000 (página inicial)

## 🆘 Solucionando Problemas

### Erro: "npm não é reconhecido"
- Instale o Node.js corretamente
- Reinicie o terminal/VS Code após a instalação

### Erro de conexão com MongoDB
- Verifique se o MongoDB está rodando
- Confirme a string de conexão no arquivo `.env`

### Erro de porta em uso
- Mude a porta no arquivo `.env`
- Ou mate o processo que está usando a porta

### Erro de dependências
```bash
# Limpar cache e reinstalar
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Problemas com o Frontend
```bash
cd client
rm -rf node_modules package-lock.json  
npm install
npm start
```

## 📝 Próximos Passos

Após a instalação bem-sucedida:

1. ✅ Criar seu primeiro cliente no painel
2. ✅ Configurar regras de IA
3. ✅ Testar no chat simulado
4. 🔧 Configurar webhook do WhatsApp (opcional)
5. 🚀 Colocar em produção

## 💡 Dicas

- Use o VS Code para melhor experiência de desenvolvimento
- Mantenha o MongoDB rodando durante o desenvolvimento
- Monitore os logs do terminal para debugar problemas
- Use o chat de teste antes de configurar o WhatsApp real

---

**Precisa de ajuda?** Consulte o README.md ou abra uma issue no GitHub.
