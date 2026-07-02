
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'troque_isso_em_producao';
const SALT_ROUNDS = 12;
const MAX_TENTATIVAS = 5;
const BLOQUEIO_MS = 15 * 60 * 1000;


const cadastrar = async (req, res) => {
  const { nome, email, senha, perfil } = req.body;

  if (!['atleta', 'tecnico'].includes(perfil)) {
    return res.status(400).json({ erro: "Perfil deve ser 'atleta' ou 'tecnico'" });
  }

  const { rows: existente } = await pool.query(
    'SELECT id FROM usuarios WHERE email = $1',
    [email]
  );
  if (existente.length > 0) {
    return res.status(409).json({ erro: 'E-mail já cadastrado' });
  }

  const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

  const { rows } = await pool.query(
    `INSERT INTO usuarios (nome, email, senha_hash, perfil)
     VALUES ($1, $2, $3, $4)
     RETURNING id, nome, email, perfil`,
    [nome, email, senhaHash, perfil]
  );

  res.status(201).json({ usuario: rows[0] });
};


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

  if (usuario.bloqueado_ate && new Date() < new Date(usuario.bloqueado_ate)) {
    return res.status(429).json({
      erro: 'Conta bloqueada temporariamente. Tente novamente em 15 minutos.',
    });
  }

  const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);

  if (!senhaCorreta) {
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

  await pool.query(
    'UPDATE usuarios SET tentativas_login = 0, bloqueado_ate = NULL WHERE id = $1',
    [usuario.id]
  );

  const accessToken = jwt.sign(
    { id: usuario.id, perfil: usuario.perfil, nome: usuario.nome },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  const refreshToken = jwt.sign(
    { id: usuario.id },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.json({
    accessToken,
    refreshToken,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      perfil: usuario.perfil,
      // Sinaliza ao frontend que deve redirecionar para troca de senha
      senha_provisoria: usuario.senha_provisoria ?? false,
    },
  });
};

// ----------------------------------------------------------
// logout — RF07
// ----------------------------------------------------------
const logout = async (req, res) => {
  await pool.query(
    'INSERT INTO tokens_invalidados (token, invalidado_em) VALUES ($1, NOW())',
    [req.token]
  );

  res.json({ mensagem: 'Logout realizado com sucesso' });
};

// ----------------------------------------------------------
// definirSenha — primeiro acesso do atleta
// O atleta usa a senha temporária para fazer login normalmente,
// depois chama esta rota para definir a senha definitiva.
// Exige autenticação (token válido).
// ----------------------------------------------------------
const definirSenha = async (req, res) => {
  const { senha_atual, nova_senha } = req.body;

  if (!senha_atual || !nova_senha) {
    return res.status(400).json({ erro: 'senha_atual e nova_senha são obrigatórios' });
  }

  if (nova_senha.length < 8) {
    return res.status(400).json({ erro: 'A nova senha deve ter no mínimo 8 caracteres' });
  }

  const { rows } = await pool.query(
    'SELECT senha_hash, senha_provisoria FROM usuarios WHERE id = $1',
    [req.usuario.id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ erro: 'Usuário não encontrado' });
  }

  const senhaAtualCorreta = await bcrypt.compare(senha_atual, rows[0].senha_hash);
  if (!senhaAtualCorreta) {
    return res.status(401).json({ erro: 'Senha atual incorreta' });
  }

  const novaHash = await bcrypt.hash(nova_senha, SALT_ROUNDS);

  await pool.query(
    `UPDATE usuarios
     SET senha_hash = $1, senha_provisoria = FALSE
     WHERE id = $2`,
    [novaHash, req.usuario.id]
  );

  res.json({ mensagem: 'Senha definida com sucesso' });
};

module.exports = { cadastrar, login, logout, definirSenha };
