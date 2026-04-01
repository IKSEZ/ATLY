// ============================================================
// controllers/auth.controller.js
// Lógica de cadastro, login e logout — RF01 ao RF07
// ============================================================

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'troque_isso_em_producao';
const SALT_ROUNDS = 12; // custo do hash bcrypt — RNF02
const MAX_TENTATIVAS = 5;
const BLOQUEIO_MS = 15 * 60 * 1000; // 15 minutos em ms — RF05

// ----------------------------------------------------------
// cadastrar — RF01
// Cria um novo usuário com perfil 'atleta' ou 'tecnico'
// ----------------------------------------------------------
const cadastrar = async (req, res) => {
  const { nome, email, senha, perfil } = req.body;

  if (!['atleta', 'tecnico'].includes(perfil)) {
    return res.status(400).json({ erro: "Perfil deve ser 'atleta' ou 'tecnico'" });
  }

  // Verifica se o e-mail já está cadastrado
  const { rows: existente } = await pool.query(
    'SELECT id FROM usuarios WHERE email = $1',
    [email]
  );
  if (existente.length > 0) {
    return res.status(409).json({ erro: 'E-mail já cadastrado' });
  }

  // Nunca salvar senha em texto puro — RNF02
  const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

  const { rows } = await pool.query(
    `INSERT INTO usuarios (nome, email, senha_hash, perfil)
     VALUES ($1, $2, $3, $4)
     RETURNING id, nome, email, perfil`,
    [nome, email, senhaHash, perfil]
  );

  res.status(201).json({ usuario: rows[0] });
};

// ----------------------------------------------------------
// login — RF02, RF05
// Autentica o usuário e retorna access token + refresh token
// ----------------------------------------------------------
const login = async (req, res) => {
  const { email, senha } = req.body;

  const { rows } = await pool.query(
    'SELECT * FROM usuarios WHERE email = $1',
    [email]
  );
  const usuario = rows[0];

  if (!usuario) {
    return res.status(401).json({ erro: 'Credenciais inválidas' });
  }

  // RF05: verifica bloqueio por tentativas excessivas
  if (usuario.bloqueado_ate && new Date() < new Date(usuario.bloqueado_ate)) {
    return res.status(429).json({
      erro: 'Conta bloqueada temporariamente. Tente novamente em 15 minutos.',
    });
  }

  const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);

  if (!senhaCorreta) {
    // Incrementa contador de tentativas falhas
    const tentativas = (usuario.tentativas_login || 0) + 1;
    const bloqueadoAte = tentativas >= MAX_TENTATIVAS
      ? new Date(Date.now() + BLOQUEIO_MS)
      : null;

    await pool.query(
      'UPDATE usuarios SET tentativas_login = $1, bloqueado_ate = $2 WHERE id = $3',
      [tentativas, bloqueadoAte, usuario.id]
    );

    return res.status(401).json({ erro: 'Credenciais inválidas' });
  }

  // Login bem-sucedido — zera o contador de tentativas
  await pool.query(
    'UPDATE usuarios SET tentativas_login = 0, bloqueado_ate = NULL WHERE id = $1',
    [usuario.id]
  );

  // Gera o access token (expira em 8h — RNF03)
  const accessToken = jwt.sign(
    { id: usuario.id, perfil: usuario.perfil, nome: usuario.nome },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  // Gera o refresh token (expira em 30 dias — RNF03)
  const refreshToken = jwt.sign(
    { id: usuario.id },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.json({
    accessToken,
    refreshToken,
    usuario: { id: usuario.id, nome: usuario.nome, perfil: usuario.perfil },
  });
};

// ----------------------------------------------------------
// logout — RF07
// Invalida o token no servidor para impedir reutilização
// ----------------------------------------------------------
const logout = async (req, res) => {
  // req.token é preenchido pelo middleware autenticar
  await pool.query(
    'INSERT INTO tokens_invalidados (token, invalidado_em) VALUES ($1, NOW())',
    [req.token]
  );

  res.json({ mensagem: 'Logout realizado com sucesso' });
};

module.exports = { cadastrar, login, logout };
