// ============================================================
// controllers/treino.controller.js
// Registro e análise de treinos — RF09, RF11, RF12, RF13
// A análise de risco é delegada ao serviço Python via HTTP
// ============================================================

const { pool } = require('../config/database');

const IA_SERVICE_URL = process.env.IA_SERVICE_URL || 'http://localhost:8000';
const IA_SERVICE_TIMEOUT_MS = Number(process.env.IA_SERVICE_TIMEOUT_MS || 10000);

async function chamarServicoIA(atletaId, treinos, perfil) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), IA_SERVICE_TIMEOUT_MS);

  try {
    const resposta = await fetch(`${IA_SERVICE_URL}/analisar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        atleta_id: atletaId,
        treinos,
        perfil,
      }),
      signal: controller.signal,
    });

    const texto = await resposta.text();
    let dados = {};

    if (texto) {
      try {
        dados = JSON.parse(texto);
      } catch {
        throw new Error(`Resposta inválida do serviço IA: ${texto}`);
      }
    }

    if (!resposta.ok) {
      const detalhe = dados.erro || dados.detail || texto || `HTTP ${resposta.status}`;
      throw new Error(`Serviço IA respondeu com erro: ${detalhe}`);
    }

    return dados;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ----------------------------------------------------------
// registrar — RF09
// Salva uma sessão de treino: intensidade, duração, volume
// ----------------------------------------------------------
const registrar = async (req, res) => {
  const atleta_id = req.body.atleta_id ?? req.body.atletaId;
  const intensidade = Number(req.body.intensidade);
  const duracao_min = Number(req.body.duracao_min ?? req.body.duracao);
  const volume = req.body.volume !== undefined ? Number(req.body.volume) : null;
  const data_treino = req.body.data_treino ?? req.body.dataTreino;
  const tipo = req.body.tipo;

  if (!atleta_id || Number.isNaN(intensidade) || Number.isNaN(duracao_min)) {
    return res.status(400).json({
      erro: 'Campos obrigatórios: atleta_id, intensidade e duracao_min',
    });
  }

  if (volume !== null && Number.isNaN(volume)) {
    return res.status(400).json({ erro: 'Campo volume deve ser numérico' });
  }

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

  const { rows: atletaRows } = await pool.query(
    'SELECT id, nome, email FROM usuarios WHERE id = $1',
    [atleta_id]
  );

  res.status(201).json({
    treino: rows[0],
    atleta: atletaRows[0] || null,
  });
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
  let analise;
  try {
    analise = await chamarServicoIA(atletaId, treinos, perfil[0] || {});
  } catch (err) {
    console.error('IA service error:', err.message);
    return res.status(503).json({
      erro: 'Serviço de análise indisponível',
      detalhe: err.message || 'Verifique se o microserviço Python está rodando em IA_SERVICE_URL',
    });
  }

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
