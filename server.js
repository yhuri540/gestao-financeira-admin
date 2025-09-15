const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const db = require('./src/db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'segredo-mude-isso';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helpers DB
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Auth middleware
function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).send('Token ausente');
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).send('Token inválido');
  }
}

// Health & enums
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.get('/api/enums', (req, res) => {
  res.json({
    TipoConta: ["contaCorrente","contaInvestimento","contaCredito","alimentacao","poupanca"],
    TipoLancamento: ["credito","debito"],
    Situacao: ["aberto","baixado"]
  });
});

// ===== Login único (apenas administrador) =====
app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body || {};
  const ADMIN_EMAIL = 'admin@admin.com';
  const ADMIN_PASS = 'admin123';

  if (email !== ADMIN_EMAIL || senha !== ADMIN_PASS) {
    return res.status(401).send('Credenciais inválidas');
  }
  const token = jwt.sign({ id: 1, email: ADMIN_EMAIL, nome: 'Administrador' }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ token, user: { id: 1, nome: 'Administrador', email: ADMIN_EMAIL } });
});

// ===== CRUD Protegido =====
app.get('/api/pessoas', auth, async (req, res) => res.json(await all('SELECT * FROM Pessoa')));
app.post('/api/pessoas', auth, async (req, res) => {
  const { razaoSocial } = req.body || {};
  if (!razaoSocial) return res.status(400).send('Informe razaoSocial');
  const { id } = await run('INSERT INTO Pessoa (razaoSocial) VALUES (?)', [razaoSocial]);
  res.status(201).json(await get('SELECT * FROM Pessoa WHERE id=?', [id]));
});

app.get('/api/bancos', auth, async (req, res) => res.json(await all('SELECT * FROM Banco')));
app.post('/api/bancos', auth, async (req, res) => {
  const { razaoSocial } = req.body || {};
  if (!razaoSocial) return res.status(400).send('Informe razaoSocial');
  const { id } = await run('INSERT INTO Banco (razaoSocial) VALUES (?)', [razaoSocial]);
  res.status(201).json(await get('SELECT * FROM Banco WHERE id=?', [id]));
});

app.get('/api/contas', auth, async (req, res) => {
  const rows = await all(`
    SELECT Conta.*, Banco.razaoSocial as bancoRazaoSocial
    FROM Conta LEFT JOIN Banco ON Banco.id = Conta.bancoId
  `);
  res.json(rows);
});
app.post('/api/contas', auth, async (req, res) => {
  const { descricao, tipoConta, agencia, numero, limite, saldo, bancoId } = req.body || {};
  if (!descricao || !tipoConta) return res.status(400).send('Informe descricao e tipoConta');
  const { id } = await run(
    `INSERT INTO Conta (descricao, tipoConta, agencia, numero, limite, saldo, bancoId) VALUES (?,?,?,?,?,?,?)`,
    [descricao, tipoConta, agencia, numero, limite ?? 0, saldo ?? 0, bancoId]
  );
  res.status(201).json(await get('SELECT * FROM Conta WHERE id=?', [id]));
});

app.get('/api/centros', auth, async (req, res) => res.json(await all('SELECT * FROM CentroCusto')));
app.post('/api/centros', auth, async (req, res) => {
  const { descricao } = req.body || {};
  if (!descricao) return res.status(400).send('Informe descricao');
  const { id } = await run('INSERT INTO CentroCusto (descricao) VALUES (?)', [descricao]);
  res.status(201).json(await get('SELECT * FROM CentroCusto WHERE id=?', [id]));
});

app.get('/api/lancamentos', auth, async (req, res) => {
  const rows = await all(`
    SELECT L.*, C.descricao as contaDescricao, P.razaoSocial as pessoaRazaoSocial, CC.descricao as centroDescricao
    FROM Lancamento L
    LEFT JOIN Conta C ON C.id = L.contaId
    LEFT JOIN Pessoa P ON P.id = L.pessoaId
    LEFT JOIN CentroCusto CC ON CC.id = L.centroCustoId
    ORDER BY date(L.dataLancamento) DESC, L.id DESC
  `);
  res.json(rows);
});
app.post('/api/lancamentos', auth, async (req, res) => {
  const { descricao, parcela, dataLancamento, dataVencimento, dataBaixa, valorDocumento, tipoLancamento, situacao, contaId, pessoaId, centroCustoId } = req.body || {};
  if (!descricao || !dataLancamento || !valorDocumento || !tipoLancamento || !situacao) {
    return res.status(400).send('Campos obrigatórios: descricao, dataLancamento, valorDocumento, tipoLancamento, situacao');
  }
  const { id } = await run(
    `INSERT INTO Lancamento (descricao, parcela, dataLancamento, dataVencimento, dataBaixa, valorDocumento, tipoLancamento, situacao, contaId, pessoaId, centroCustoId)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [descricao, parcela, dataLancamento, dataVencimento, dataBaixa, valorDocumento, tipoLancamento, situacao, contaId, pessoaId, centroCustoId]
  );
  res.status(201).json(await get('SELECT * FROM Lancamento WHERE id=?', [id]));
});

// SPA fallback
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
