# Deploy na DigitalOcean (Droplet) - Guia Rápido

## 1. Criar Droplet
1. Acesse DigitalOcean > Create > Droplets.
2. Imagem: Ubuntu 22.04 LTS.
3. Plano: Basic / Regular (mínimo 2GB RAM recomendado).
4. Datacenter: mais próximo dos usuários.
5. Authentication: SSH Key (recomendado). Adicione sua chave.
6. Hostname: nexar-app.
7. Create Droplet.

Anote o IP público.

## 2. Preparar Servidor
```bash
ssh root@SEU_IP
apt update && apt upgrade -y
curl -fsSL https://get.docker.com | sh
usermod -aG docker $USER
# (logout e login novamente para ativar o grupo docker)
apt install -y git
```

## 3. Clonar Projeto
```bash
git clone SEU_REPO_URL nexar
cd nexar
cp .env.example .env
nano .env  # Ajustar variáveis
```
Principais variáveis:
```
PORT=5010
MONGO_URI=mongodb://mongo:27017/nexar
OPENAI_API_KEY=sua_chave
TZ=America/Sao_Paulo
```

## 4. Build e Subida
```bash
docker compose build
docker compose up -d
```
Verificar logs:
```bash
docker compose logs -f app
```

## 5. Acesso
- Painel/API: http://SEU_IP:5010
- Escaneie QR do WhatsApp no painel (sessão persiste no volume).

## 6. HTTPS (Opcional com Caddy)
```bash
apt install -y caddy
cat > /etc/caddy/Caddyfile <<EOF
SEU_DOMINIO {
  reverse_proxy 127.0.0.1:5010
}
EOF
systemctl reload caddy
```
Certificado TLS automático (Let's Encrypt).

## 7. Backup
- Volume Mongo: `mongo_data` (use `mongodump` em cron se quiser export).
- Sessão WhatsApp: volume `wwebjs_auth` (preserva login).

Exemplo dump:
```bash
docker exec nexar_mongo mongodump --archive=/data/db/backup_`date +%F`.gz --gzip
```
Copiar:
```bash
docker cp nexar_mongo:/data/db/backup_2025-09-09.gz .
```

## 8. Atualizar Código
```bash
cd nexar
git pull
docker compose build app
docker compose up -d
```
Se só código JS (sem novas deps):
```bash
docker compose restart app
```

## 9. Logs e Diagnóstico
```bash
docker compose logs -f app
docker compose logs -f mongo
docker stats
```

## 10. Limpeza
```bash
docker system prune -f
```
(Cuidado: remove imagens não usadas.)

## 11. Segurança Básica
```bash
apt install -y ufw
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw enable
```
Desabilitar login root por senha (editar `/etc/ssh/sshd_config`).

## 12. Escala Futura
- Separar Mongo (Managed Atlas) e apontar `MONGO_URI`.
- Múltiplos números WhatsApp => múltiplos containers ou pods (não usar cluster PM2 para mesma sessão).

## 13. Teste Pós-Deploy
Checklist rápido:
- [ ] GET / (ou endpoint de status) responde 200
- [ ] Sessão WhatsApp conectada e permanece após `docker compose restart`
- [ ] Logs sem erros de Chromium recorrentes
- [ ] Agendamento funcionando
- [ ] AI responde com contexto

Pronto. Qualquer ajuste adicional (monitoramento, CI/CD) pode ser adicionado depois.
