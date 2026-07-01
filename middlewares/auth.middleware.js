

const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'troque_isso_em_producao';


const autenticar = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ erro: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];

    const { rows } = await pool.query(
      'SELECT 1 FROM tokens_invalidados WHERE token = $1',
      [token]
    );
    if (rows.length > 0) {
      return res.status(401).json({ erro: 'Sessão encerrada. Faça login novamente.' });
    }

    const payload = jwt.verify(token, JWT_SECRET);

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
