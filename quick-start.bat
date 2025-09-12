@echo off
title IA Nexar - Quick Start
color 0A

echo 🚀 IA Nexar - Iniciando servidores...

cd /d "%~dp0"

echo 🖥️  Iniciando backend...
start /min "Backend" cmd /c "npm start"

timeout /t 3 /nobreak >nul

echo ⚛️  Iniciando React...
start /min "React" cmd /c "npm run client"

echo ⏳ Aguardando compilação...
timeout /t 20 /nobreak >nul

echo 🌐 Abrindo navegador...
start http://localhost:3001

echo.
echo ✅ Aplicação rodando em: http://localhost:3001
echo 💡 Para parar, feche as janelas do Node.js
echo.
pause
