# Deploy no Vercel (somente frontend)

Este projeto possui backend em Node/Express e frontend em React (CRA). Para o Vercel, o fluxo recomendado é publicar APENAS o frontend (pasta `client`) como static build e apontar a API para um backend hospedado (DO, Render, Railway, etc.).

## Passos rápidos
- No Vercel, conecte o repositório do GitHub.
- Em Project Settings → Root Directory, selecione `client`.
- Configure:
  - Build Command: `npm run build`
  - Output Directory: `build`
  - Install Command: `npm install`
- Opcionalmente, adicione `REACT_APP_API_BASE` nas Environment Variables do Vercel.

Ou utilize `vercel.json` na raiz com:
{
  "version": 2,
  "builds": [{ "src": "client/package.json", "use": "@vercel/static-build" }]
}

## Observações
- O erro “react-scripts: comando não encontrado” ocorre quando o Vercel tenta buildar na raiz em vez de `client`. Aponte corretamente o diretório ou use o `vercel.json` acima.
- Não suba .env do backend no Vercel. O frontend usa variáveis prefixadas com `REACT_APP_`.
- Se quiser hospedar backend no Vercel, migre para API Routes (serverless) ou use outra plataforma para o Node/Express com WebSocket/whatsapp-web.js (que requer Chromium e não roda em ambiente serverless do Vercel).