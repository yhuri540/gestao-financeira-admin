#!/usr/bin/env bash
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo "[ERRO] Node.js não encontrado. Instale a versão LTS em https://nodejs.org/"
  exit 1
fi
npm install
npm start
