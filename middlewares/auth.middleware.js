// ============================================================
// middlewares/auth.middleware.js
// Responsável por verificar o token JWT e controlar acesso
// por perfil (RBAC) — RF02, RF03, RF07
// ============================================================

const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'troque_isso_em_producao';

// ----------------------------------------------------------
// autenticar — verifica se o token JWT é válido
// Use este middleware em qualquer rota protegida
// ----------------------------------------------------------
const autenticar = async (req, res, next) => {
  try {
    // O token vem no header: Authorization: Bearer <token>
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ erro: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];

    // Verifica se o token foi invalidado (logout explícito — RF07)
    const { rows } = await pool.query(
      'SELECT 1 FROM tokens_invalidados WHERE token = $1',
      [token]
    );
    if (rows.length > 0) {
      return res.status(401).json({ erro: 'Sessão encerrada. Faça login novamente.' });
    }

    // Valida a assinatura e a expiração do token
    const payload = jwt.verify(token, JWT_SECRET);

    // Anexa os dados do usuário na requisição para uso nos controllers
    req.usuario = payload;
    req.token = token;

    next();
  } catch (err) {
    console.error('JWT auth error:', err);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ erro: 'Token expirado' });
    }
    return res.status(401).json({ erro: 'Token inválido' });
  }
};

// ----------------------------------------------------------
// autorizar — verifica se o usuário tem o perfil exigido
// Uso: router.get('/rota', autenticar, autorizar('tecnico'), controller)
// ----------------------------------------------------------
const autorizar = (...perfisPermitidos) => {
  return (req, res, next) => {
    if (!perfisPermitidos.includes(req.usuario.perfil)) {
      return res.status(403).json({
        erro: 'Acesso negado. Você não tem permissão para este recurso.',
      });
    }
    next();
  };
};

module.exports = { autenticar, autorizar };
