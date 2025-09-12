<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Instruções para o GitHub Copilot

Este é um projeto de Plataforma SaaS de IA Vertical para atendimento via WhatsApp.

## Contexto do Projeto

### Tecnologias Utilizadas
- **Backend**: Node.js + Express.js
- **Frontend**: React.js
- **Banco de Dados**: MongoDB com Mongoose
- **Integração**: WhatsApp Cloud API
- **Estilo**: CSS módulos + React Icons

### Arquitetura
- **Backend**: API RESTful com rotas organizadas em módulos
- **Frontend**: SPA React com roteamento via React Router
- **IA**: Motor de lógica programada baseado em palavras-chave
- **Webhook**: Integração em tempo real com WhatsApp

### Estrutura de Dados
- Cada cliente tem configurações próprias de IA
- Sistema de palavras-chave e respostas personalizadas
- Estatísticas de uso e performance
- Resposta padrão configurável

### Funcionalidades Principais
1. **Gerenciamento de Clientes**: CRUD completo via painel web
2. **Configuração de IA**: Interface para treinar IA com palavras-chave
3. **Webhook WhatsApp**: Recepção e processamento de mensagens
4. **Dashboard**: Estatísticas e monitoramento em tempo real
5. **Teste de Chat**: Simulador para validar configurações

### Padrões de Código
- Use nomes descritivos em português para variáveis e funções
- Mantenha consistência com os componentes React existentes
- Use async/await para operações assíncronas
- Implemente tratamento de erro adequado
- Use toast notifications para feedback do usuário
- Mantenha responsividade em todos os componentes

### Boas Práticas
- Validação de dados tanto no frontend quanto backend
- Logs estruturados para debug
- Segurança com sanitização de inputs
- Performance otimizada com lazy loading quando necessário
- UX intuitiva com loading states e feedback visual

### Convenções
- Arquivos React: PascalCase (ex: ClientList.js)
- Componentes: Função com export default
- Estilos: Arquivo CSS separado com mesmo nome
- API: Responses padronizadas com { success, data, error }
- Banco: Schemas bem definidos com validações
