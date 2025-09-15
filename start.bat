@echo off
cd /d %~dp0
where node >nul 2>nul
if errorlevel 1 (
  echo [ERRO] Node.js nao encontrado. Instale a versao LTS de https://nodejs.org/ e tente novamente.
  pause
  exit /b 1
)
npm install
npm start
pause

