GESTÃO FINANCEIRA (ADMIN) — COMO RODAR
--------------------------------------
1) Pré-requisito: Node.js LTS instalado (https://nodejs.org/)
2) Windows: dê 2 cliques em start.bat
   Linux/Mac: no terminal, rode:  chmod +x start.sh && ./start.sh
3) Acesse no navegador:  http://localhost:3000
4) Login (apenas admin):
   - email: admin@admin.com
   - senha: admin123

Pastas:
- public/index.html  -> frontend
- server.js          -> backend (Express)
- src/db.js          -> SQLite e tabelas

Se algo nao abrir, visite: http://localhost:3000/api/health  (deve retornar {"ok":true})
