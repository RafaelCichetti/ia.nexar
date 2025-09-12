FROM node:20-slim

# Dependências necessárias para Chromium (whatsapp-web.js / puppeteer)
RUN apt-get update && apt-get install -y \
  ca-certificates fonts-liberation libasound2 libatk1.0-0 libatk-bridge2.0-0 \
  libcups2 libdrm2 libxkbcommon0 libxdamage1 libxfixes3 libxcomposite1 \
  libxrandr2 libxext6 libxshmfence1 libnss3 libx11-6 libx11-xcb1 libxcb1 \
  libxss1 libxtst6 libpangocairo-1.0-0 libpango-1.0-0 libgbm1 libgtk-3-0 \
  wget unzip gnupg && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install --production

COPY . .

ENV NODE_ENV=production
ENV PORT=5010
ENV TZ=America/Sao_Paulo

RUN mkdir -p /app/.wwebjs_auth
VOLUME ["/app/.wwebjs_auth"]

EXPOSE 5010
CMD ["node", "server.js"]
