# 💰 Sistema de Gestão Financeira (Admin Only)

Aplicação web de **gestão financeira** com **Node.js + Express no backend e **HTML/CSS/JS** no frontend.  
O acesso é restrito a um **único administrador**, com login fixo.

---

## 🚀 Funcionalidades
- **Login exclusivo de administrador**
  - Email: `admin@admin.com`
  - Senha: `admin123`
- **Dashboard** moderno com:
  - Saldo total das contas
  - Contas a pagar (em aberto)
  - Cartões de crédito
  - Créditos (depósitos/entradas)
  - Débitos (saques/saídas)
- **Extrato** em tempo real com histórico de lançamentos
- **Cadastros**:
  - Pessoas
  - Bancos
  - Contas
  - Centros de Custo
  - Lançamentos
- **API REST** protegida por **JWT** (testável no Postman)

---

## 🛠️ Tecnologias
- [Node.js](https://nodejs.org/)  
- [Express](https://expressjs.com/)  
- [SQLite3](https://www.sqlite.org/)  
- [JSON Web Token (JWT)](https://jwt.io/)  
- Frontend em **HTML, CSS e JavaScript puro**

---

## 📥 Instalação

Clone o repositório:
```bash
git clone https://github.com/yhuri540/gestao-financeira-admin.git
cd gestao-financeira-admin
