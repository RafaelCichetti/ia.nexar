# IA Nexar - SaaS WhatsApp AI Platform
# Script PowerShell para iniciar os servidores automaticamente

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  IA NEXAR - SAAS WHATSAPP AI PLATFORM" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Iniciando servidores..." -ForegroundColor Yellow
Write-Host ""

# Verifica se o Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado! Por favor, instale o Node.js primeiro." -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Navega para o diretório do script
Set-Location $PSScriptRoot

# Inicia o servidor backend
Write-Host "🔧 Iniciando servidor backend (Node.js + Express)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm start" -WindowStyle Normal

# Aguarda 3 segundos
Start-Sleep -Seconds 3

# Inicia o cliente React
Write-Host "🎨 Iniciando cliente React..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run client" -WindowStyle Normal

# Aguarda 5 segundos
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "✅ Servidores iniciados com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 URLs disponíveis:" -ForegroundColor Yellow
Write-Host "   Backend API: http://localhost:3000" -ForegroundColor White
Write-Host "   React App:   http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "📱 WhatsApp Webhook: http://localhost:3000/webhook" -ForegroundColor Magenta
Write-Host "⚙️  API Clientes:     http://localhost:3000/client" -ForegroundColor Magenta
Write-Host ""
Write-Host "🎯 Aguardando React compilar..." -ForegroundColor Yellow

# Aguarda mais 15 segundos para o React compilar completamente
Start-Sleep -Seconds 15

Write-Host "🌐 Abrindo a aplicação no navegador..." -ForegroundColor Cyan
Start-Process "http://localhost:3001"

Write-Host ""
Write-Host "🎉 Aplicação iniciada com sucesso!" -ForegroundColor Green
Write-Host "   Pressione qualquer tecla para fechar este terminal." -ForegroundColor Yellow
Write-Host "   (Os servidores continuarão rodando nas outras janelas)" -ForegroundColor Yellow
Write-Host ""

Read-Host "Pressione Enter para continuar"
