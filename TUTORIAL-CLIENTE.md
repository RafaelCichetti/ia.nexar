# Guia Completo - Cadastro de Cliente e Configuração WhatsApp

## 📋 Tutorial Passo a Passo

### 1️⃣ Primeiro Passo: Iniciar o Sistema

```bash
# Terminal 1 - Backend (Porta 5000)
cd "c:\teste de ia nexar"
npm start

# Terminal 2 - Frontend (Porta 3000)
cd "c:\teste de ia nexar\client"
npm start
```

### 2️⃣ Cadastrar Novo Cliente

1. **Acesse**: http://localhost:3000
2. **Clique em**: "Novo Cliente" (botão verde)
3. **Preencha os dados**:
   - **Nome**: Teste IA
   - **Empresa**: Minha Empresa Teste
   - **Telefone**: 11999999999
   - **Email**: teste@email.com
4. **Clique em**: "Cadastrar Cliente"

### 3️⃣ Configurar IA do Cliente

1. **Na lista de clientes**, clique em "Editar" no cliente criado
2. **Configure a IA**:
   - **Resposta Padrão**: "Olá! Como posso ajudar você hoje?"
   - **Adicione palavras-chave**:
     - Palavra: "oi" → Resposta: "Olá! Bem-vindo!"
     - Palavra: "preço" → Resposta: "Nossos preços são competitivos. Gostaria de mais informações?"
     - Palavra: "produto" → Resposta: "Temos diversos produtos disponíveis!"
3. **Salve as configurações**

### 4️⃣ Conectar WhatsApp

1. **No painel do cliente**, procure a seção "WhatsApp"
2. **Clique em**: "Conectar WhatsApp"
3. **Escaneie o QR Code**:
   - Abra seu WhatsApp
   - Vá em Configurações > Aparelhos conectados
   - Toque em "Conectar um aparelho"
   - Escaneie o QR Code da tela
4. **Aguarde a conexão** (deve aparecer "Conectado" em verde)

### 5️⃣ Testar a IA

#### Teste Interno:
1. **Clique em**: "Testar Chat" no cliente
2. **Digite mensagens**:
   - "oi" (deve responder com a resposta configurada)
   - "preço" (deve responder sobre preços)
   - "qualquer coisa" (deve usar resposta padrão)

#### Teste Real no WhatsApp:
1. **Envie mensagens** para o número conectado
2. **Teste as palavras-chave** configuradas
3. **Verifique as respostas** automáticas

### 6️⃣ Monitoramento

1. **Dashboard**: Veja estatísticas em tempo real
2. **Logs**: Acompanhe mensagens no console do backend
3. **Status**: Verde = Conectado, Amarelo = Conectando, Vermelho = Desconectado

---

## 🔧 Comandos Úteis

### Reiniciar Sistema:
```bash
# Parar tudo com Ctrl+C
# Reiniciar backend
npm start

# Reiniciar frontend (novo terminal)
cd client && npm start
```

### Verificar Status:
- **Backend**: http://localhost:5000/api/whatsapp/status/:clientId
- **Frontend**: http://localhost:3000

### Logs Importantes:
- **Conexão WhatsApp**: Aparece no terminal do backend
- **Mensagens**: Console do navegador (F12)
- **Erros**: Terminal do backend

---

## ⚠️ Solução de Problemas

### QR Code não aparece:
1. Recarregue a página
2. Verifique se o backend está rodando
3. Tente desconectar e conectar novamente

### WhatsApp não responde:
1. Verifique se está conectado (status verde)
2. Confirme que as palavras-chave estão configuradas
3. Teste primeiro no chat interno

### Erro de conexão:
1. Feche WhatsApp Web em outras abas
2. Reinicie o sistema
3. Tente conectar novamente

---

## 🎯 Próximos Passos

1. **Teste completo** com seu WhatsApp
2. **Configure mais palavras-chave** conforme necessário
3. **Monitore o desempenho** no dashboard
4. **Ajuste respostas** baseado nos testes

**Está tudo pronto para uso!** 🚀
