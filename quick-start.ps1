# IA Nexar - Quick Start
# Script simples e rápido para desenvolvimento

Write-Host "🚀 IA Nexar - Iniciando..." -ForegroundColor Green

# Navega para o diretório correto
Set-Location $PSScriptRoot

# Mata processos existentes nas portas (evita conflitos)
Write-Host "🔧 Verificando portas..." -ForegroundColor Yellow
try {
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue
} catch {}

# Inicia backend em segundo plano
Write-Host "🖥️  Backend iniciando..." -ForegroundColor Cyan
Start-Job -ScriptBlock { 
    Set-Location $using:PSScriptRoot
    npm start 
} -Name "Backend"

# Aguarda um pouco
Start-Sleep -Seconds 3

# Inicia React
Write-Host "⚛️  React iniciando..." -ForegroundColor Blue
Start-Job -ScriptBlock { 
    Set-Location $using:PSScriptRoot
    npm run client 
} -Name "ReactClient"

# Aguarda React compilar
Write-Host "⏳ Aguardando compilação..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

# Abre navegador
Write-Host "🌐 Abrindo navegador..." -ForegroundColor Green
Start-Process "http://localhost:3001"

Write-Host ""
Write-Host "✅ Pronto! Aplicação rodando em:" -ForegroundColor Green
Write-Host "   http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "💡 Para parar os servidores, feche as janelas do Node.js" -ForegroundColor Yellow

# Mantém o terminal aberto para mostrar status
Write-Host ""
Write-Host "📊 Status dos Jobs:" -ForegroundColor Cyan
Get-Job

Read-Host "`nPressione Enter para sair"

# Limpa os jobs ao sair
Get-Job | Remove-Job -Force
