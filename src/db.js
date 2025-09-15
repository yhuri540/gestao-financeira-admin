const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_FILE = path.join(DATA_DIR, 'database.sqlite');
const db = new sqlite3.Database(DB_FILE);

function initDb() {
  db.serialize(() => {
    db.run(`PRAGMA foreign_keys = ON;`);

    db.run(`CREATE TABLE IF NOT EXISTS Pessoa (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      razaoSocial TEXT NOT NULL
    );`);

    db.run(`CREATE TABLE IF NOT EXISTS Banco (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      razaoSocial TEXT NOT NULL
    );`);

    db.run(`CREATE TABLE IF NOT EXISTS CentroCusto (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      descricao TEXT NOT NULL
    );`);

    db.run(`CREATE TABLE IF NOT EXISTS Conta (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      descricao TEXT NOT NULL,
      tipoConta TEXT NOT NULL CHECK(tipoConta IN ('contaCorrente','contaInvestimento','contaCredito','alimentacao','poupanca')),
      agencia TEXT,
      numero TEXT,
      limite REAL DEFAULT 0,
      saldo REAL DEFAULT 0,
      bancoId INTEGER,
      FOREIGN KEY (bancoId) REFERENCES Banco(id) ON DELETE SET NULL
    );`);

    db.run(`CREATE TABLE IF NOT EXISTS Lancamento (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      descricao TEXT NOT NULL,
      parcela TEXT,
      dataLancamento TEXT NOT NULL,
      dataVencimento TEXT,
      dataBaixa TEXT,
      valorDocumento REAL NOT NULL,
      tipoLancamento TEXT NOT NULL CHECK(tipoLancamento IN ('credito','debito')),
      situacao TEXT NOT NULL CHECK(situacao IN ('aberto','baixado')),
      contaId INTEGER,
      pessoaId INTEGER,
      centroCustoId INTEGER,
      FOREIGN KEY (contaId) REFERENCES Conta(id) ON DELETE SET NULL,
      FOREIGN KEY (pessoaId) REFERENCES Pessoa(id) ON DELETE SET NULL,
      FOREIGN KEY (centroCustoId) REFERENCES CentroCusto(id) ON DELETE SET NULL
    );`);
  });
  console.log('Banco inicializado ✅');
}

initDb();
module.exports = db;
