// Bridge de inicialização para Render.com
// Mantém a lógica existente em server.js sem apagar arquivos.
// Este arquivo apenas importa e inicia o app exportado em server.js.

// Observação: as dependências permanecem no package.json da raiz.
// O Render executa "npm start" com "cd server && npm install && node index.js".

const path = require('path');

// Carrega o servidor existente na raiz
require(path.join(__dirname, '..', 'server.js'));
