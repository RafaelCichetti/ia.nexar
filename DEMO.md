# 🎬 Demonstração do Sistema - SaaS IA WhatsApp

## 🎯 Cenário de Exemplo

Vamos simular uma **loja de informática** que quer automatizar o atendimento via WhatsApp.

---

## 📋 Passo a Passo da Demonstração

### 1. 🏢 Criar Cliente

**Nome:** TechStore Informática  
**ID:** techstore123  
**Telefone:** 5511987654321  

### 2. 🤖 Configurar IA

| Palavra-chave | Resposta |
|---------------|----------|
| horário | Funcionamos de segunda a sexta das 8h às 18h, e sábados das 8h às 14h! |
| endereço | Estamos localizados na Rua das Flores, 123 - Centro. Próximo ao metrô Sé! |
| entrega | Fazemos entregas em toda a região! O prazo é de 1 a 3 dias úteis. |
| preço | Nossos preços são super competitivos! Me informe qual produto você procura? |
| notebook | Temos notebooks Dell, HP e Lenovo a partir de R$ 1.500! Quer saber mais? |
| mouse | Mouses gamers e office a partir de R$ 25! Qual tipo você precisa? |
| garantia | Todos nossos produtos têm garantia mínima de 1 ano! |
| pagamento | Aceitamos cartão, PIX, boleto e parcelamos em até 12x sem juros! |

**Resposta Padrão:** Olá! Sou a IA da TechStore! Para melhor atendimento, me informe: horário, endereço, produtos, entrega ou preços. Um vendedor também pode te ajudar pelo WhatsApp (11) 99999-9999!

### 3. 💬 Conversas de Teste

#### Conversa 1 - Informações Básicas
```
👤 Cliente: Oi, vocês abrem hoje?
🤖 IA: Funcionamos de segunda a sexta das 8h às 18h, e sábados das 8h às 14h!

👤 Cliente: Onde ficam localizados?
🤖 IA: Estamos localizados na Rua das Flores, 123 - Centro. Próximo ao metrô Sé!
```

#### Conversa 2 - Produtos
```
👤 Cliente: Preciso de um notebook para trabalho
🤖 IA: Temos notebooks Dell, HP e Lenovo a partir de R$ 1.500! Quer saber mais?

👤 Cliente: Qual a forma de pagamento?
🤖 IA: Aceitamos cartão, PIX, boleto e parcelamos em até 12x sem juros!
```

#### Conversa 3 - Entrega
```
👤 Cliente: Vocês fazem entrega?
🤖 IA: Fazemos entregas em toda a região! O prazo é de 1 a 3 dias úteis.

👤 Cliente: E a garantia dos produtos?
🤖 IA: Todos nossos produtos têm garantia mínima de 1 ano!
```

#### Conversa 4 - Pergunta Não Mapeada
```
👤 Cliente: Vocês consertam computadores?
🤖 IA: Olá! Sou a IA da TechStore! Para melhor atendimento, me informe: horário, endereço, produtos, entrega ou preços. Um vendedor também pode te ajudar pelo WhatsApp (11) 99999-9999!
```

---

## 📊 Resultados Esperados

Após executar os testes acima, você deve ter:

### Estatísticas
- **Total de mensagens:** 8
- **Respostas da IA:** 6 (75%)
- **Respostas padrão:** 2 (25%)

### Taxa de Acerto
- ✅ horário → 100%
- ✅ endereço → 100%  
- ✅ notebook → 100%
- ✅ pagamento → 100%
- ✅ entrega → 100%
- ✅ garantia → 100%
- ❌ conserto → Resposta padrão (esperado)

---

## 🎯 Demonstração Avançada

### Variações de Palavras-chave

Teste como a IA funciona com diferentes formas de perguntar:

| Pergunta do Cliente | Palavra-chave Detectada | Funciona? |
|-------------------|----------------------|-----------|
| "Que horas vocês abrem?" | horário | ✅ |
| "Qual o horário?" | horário | ✅ |
| "Funcionam aos domingos?" | horário | ✅ |
| "Onde é a loja?" | endereço | ✅ |
| "Qual o endereço?" | endereço | ✅ |
| "Como chego aí?" | endereço | ✅ |
| "Quanto custa um notebook?" | notebook | ✅ |
| "Tem mouse barato?" | mouse | ✅ |
| "Aceita cartão?" | pagamento | ✅ |

### Teste de Confiança

A IA calcula um nível de confiança para cada resposta:

- **90-100%:** Match exato com palavra-chave
- **70-89%:** Palavra-chave contida na mensagem  
- **50-69%:** Palavras relacionadas encontradas
- **<50%:** Resposta padrão

---

## 🚀 Próximos Passos

Após a demonstração:

1. **Refinar regras:** Adicione mais palavras-chave baseadas nas perguntas reais
2. **Melhorar respostas:** Torne as respostas mais naturais e informativas
3. **Adicionar sinonimos:** "preço" = "valor" = "custo" = "quanto custa"
4. **Configurar WhatsApp:** Conecte com WhatsApp Business real
5. **Monitorar performance:** Use as estatísticas para otimizar

---

## 🔄 Script de Demonstração Automatizado

Execute no chat de teste do sistema:

```javascript
// Lista de mensagens para testar
const testMessages = [
  "Oi, vocês abrem hoje?",
  "Onde ficam localizados?", 
  "Preciso de um notebook para trabalho",
  "Qual a forma de pagamento?",
  "Vocês fazem entrega?",
  "E a garantia dos produtos?",
  "Tem mouse gamer?",
  "Vocês consertam computadores?"
];

// Execute uma por vez no chat de teste
testMessages.forEach((msg, index) => {
  console.log(`${index + 1}. ${msg}`);
});
```

---

## 📈 Métricas de Sucesso

Uma boa configuração de IA deve ter:

- **Taxa de acerto:** >80%
- **Tempo de resposta:** <2 segundos
- **Satisfação:** Respostas úteis e naturais
- **Cobertura:** Principais dúvidas mapeadas

---

**💡 Dica:** Use dados reais de conversas anteriores para criar configurações mais eficazes!
