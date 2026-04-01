// ============================================================
// controllers/treino.controller.js
// Registro e análise de treinos — RF09, RF11, RF12, RF13
// A análise de risco é delegada ao serviço Python via HTTP
// ============================================================

const { pool } = require('../config/database');
const axios = require('axios');

const IA_SERVICE_URL = process.env.IA_SERVICE_URL || 'http://localhost:8000';

// ----------------------------------------------------------
// registrar — RF09
// Salva uma sessão de treino: intensidade, duração, volume
// ----------------------------------------------------------
const registrar = async (req, res) => {
  const { atleta_id, intensidade, duracao_min, volume, data_treino, tipo } = req.body;

  // Atleta só pode registrar treino para si mesmo
  if (req.usuario.perfil === 'atleta' && req.usuario.id !== atleta_id) {
    return res.status(403).json({ erro: 'Acesso negado' });
  }

  // Carga de treino = intensidade × duração (métrica simples e eficaz)
  const carga = intensidade * duracao_min;

  const { rows } = await pool.query(
    `INSERT INTO sessoes_treino
       (atleta_id, intensidade, duracao_min, volume, carga, tipo, data_treino)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [atleta_id, intensidade, duracao_min, volume, carga, tipo, data_treino || new Date()]
  );

  res.status(201).json({ treino: rows[0] });
};

// ----------------------------------------------------------
// listarPorAtleta — histórico de treinos
// ----------------------------------------------------------
const listarPorAtleta = async (req, res) => {
  const { atletaId } = req.params;

  // Controle de acesso: atleta vê só o próprio histórico (RF03)
  if (req.usuario.perfil === 'atleta' && req.usuario.id !== parseInt(atletaId)) {
    return res.status(403).json({ erro: 'Acesso negado' });
  }

  const { rows } = await pool.query(
    `SELECT * FROM sessoes_treino
     WHERE atleta_id = $1
     ORDER BY data_treino DESC
     LIMIT 50`,
    [atletaId]
  );

  res.json({ treinos: rows });
};

// ----------------------------------------------------------
// analisarCarga — RF11, RF12, RF13
// Busca o histórico de treinos e envia para o serviço Python
// que calcula o ACWR e retorna o nível de risco
// ----------------------------------------------------------
const analisarCarga = async (req, res) => {
  const { atletaId } = req.params;

  if (req.usuario.perfil === 'atleta' && req.usuario.id !== parseInt(atletaId)) {
    return res.status(403).json({ erro: 'Acesso negado' });
  }

  // Busca as últimas 4 semanas de treino para o cálculo do ACWR
  const { rows: treinos } = await pool.query(
    `SELECT data_treino, carga
     FROM sessoes_treino
     WHERE atleta_id = $1
       AND data_treino >= NOW() - INTERVAL '28 days'
     ORDER BY data_treino`,
    [atletaId]
  );

  // Busca dados físicos do atleta para contextualizar a análise
  const { rows: perfil } = await pool.query(
    'SELECT idade, peso, historico_lesoes FROM atleta_perfil WHERE usuario_id = $1',
    [atletaId]
  );

  // Chama o microserviço Python de IA
  // O Python faz o cálculo pesado e retorna { acwr, nivel_risco, alerta }
  const resposta = await axios.post(`${IA_SERVICE_URL}/analisar`, {
    atleta_id: atletaId,
    treinos,
    perfil: perfil[0] || {},
  });

  const analise = resposta.data;

  // RF13: se risco elevado, registra alerta no banco
  if (analise.nivel_risco === 'alto') {
    await pool.query(
      `INSERT INTO alertas (atleta_id, tipo, mensagem, criado_em)
       VALUES ($1, 'sobrecarga', $2, NOW())`,
      [atletaId, analise.mensagem]
    );
  }

  res.json({ analise });
};

module.exports = { registrar, listarPorAtleta, analisarCarga };
