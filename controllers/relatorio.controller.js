
const { pool } = require('../config/database');


const desempenho = async (req, res) => {
  const { atletaId } = req.params;

  if (req.usuario.perfil === 'atleta' && req.usuario.id !== parseInt(atletaId)) {
    return res.status(403).json({ erro: 'Acesso negado' });
  }

  
  const { rows } = await pool.query(
    `SELECT
       DATE_TRUNC('week', data_treino) AS semana,
       SUM(carga) AS carga_total,
       AVG(intensidade) AS intensidade_media,
       COUNT(*) AS total_sessoes
     FROM sessoes_treino
     WHERE atleta_id = $1
       AND data_treino >= NOW() - INTERVAL '8 weeks'
     GROUP BY semana
     ORDER BY semana`,
    [atletaId]
  );

  res.json({ semanas: rows });
};


const alertas = async (req, res) => {
  const { atletaId } = req.params;

  if (req.usuario.perfil === 'atleta' && req.usuario.id !== parseInt(atletaId)) {
    return res.status(403).json({ erro: 'Acesso negado' });
  }

  const { rows } = await pool.query(
    `SELECT * FROM alertas
     WHERE atleta_id = $1
     ORDER BY criado_em DESC`,
    [atletaId]
  );

  res.json({ alertas: rows });
};

module.exports = { desempenho, alertas };
