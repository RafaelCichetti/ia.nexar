@echo off
title IA Nexar - SaaS WhatsApp AI Platform
color 0A

echo.
echo ========================================
echo  IA NEXAR - SAAS WHATSAPP AI PLATFORM
echo ========================================
echo.
echo 🚀 Iniciando servidores...
echo.

:: Verifica se o Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js nao encontrado! Por favor, instale o Node.js primeiro.
    pause
    exit /b 1
)

:: Navega para o diretório do projeto
cd /d "%~dp0"



:: Define porta padrão para o backend (compatível com .env e frontend)
set BACKEND_PORT=5010

:: Inicia o servidor backend em uma nova janela na porta correta
echo 🔧 Iniciando servidor backend (Node.js + Express) na porta %BACKEND_PORT%...
start "Backend Server - Porta %BACKEND_PORT%" cmd /k "set PORT=%BACKEND_PORT% && npm start"

:: Aguarda 5 segundos para o backend inicializar
timeout /t 5 /nobreak >nul

:: Inicia o cliente React em uma nova janela
echo 🎨 Iniciando cliente React...
cd client
start "React Client" cmd /k "npm start"
cd ..

:: Aguarda 8 segundos para o React compilar
timeout /t 8 /nobreak >nul

echo.
echo ✅ Servidores iniciados com sucesso!
echo.
echo 🌐 URLs disponíveis:
echo    Backend API: http://localhost:%BACKEND_PORT%
echo    React App:   http://localhost:3000
echo.
echo 📱 WhatsApp Webhook: http://localhost:%BACKEND_PORT%/webhook
echo ⚙️  API Clientes:     http://localhost:%BACKEND_PORT%/client
echo.
echo 🎯 Abrindo a aplicação no navegador...

:: Aguarda mais 12 segundos para garantir que o React carregou
timeout /t 12 /nobreak >nul

:: Abre o navegador automaticamente
start http://localhost:3000

echo.
echo 🎉 Aplicação iniciada com sucesso!
echo.
echo 🤖 Sistema IA OpenAI integrado e pronto para uso!
echo 📱 Conecte seu WhatsApp via QR Code na interface
echo.
echo    Pressione qualquer tecla para fechar este terminal.
echo    (Os servidores continuarão rodando nas outras janelas)
echo.
pause
