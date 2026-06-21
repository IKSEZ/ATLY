// ============================================================
// controllers/atleta.controller.js
// CRUD de atletas com controle de acesso por perfil — RF03, RF08, RF10
// ============================================================

const crypto = require('crypto');
const { pool } = require('../config/database');

const IA_SERVICE_URL = process.env.IA_SERVICE_URL || 'http://127.0.0.1:8000';
const IA_SERVICE_TIMEOUT_MS = Number(process.env.IA_SERVICE_TIMEOUT_MS || 10000);

function obterUrlsServicoIA() {
  const urls = [IA_SERVICE_URL];

  try {
    const baseUrl = new URL(IA_SERVICE_URL);

    if (baseUrl.hostname === 'localhost' || baseUrl.hostname === '127.0.0.1') {
      const fallbackUrl = new URL(IA_SERVICE_URL);
      fallbackUrl.hostname = baseUrl.hostname === 'localhost' ? '127.0.0.1' : 'localhost';
      urls.push(fallbackUrl.toString().replace(/\/$/, ''));
    }
  } catch {
    // Mantém apenas a URL original quando o valor do ambiente estiver malformado.
  }

  return [...new Set(urls)];
}

async function analisarAtleta(atletaId) {
  const { rows: treinos } = await pool.query(
    `SELECT data_treino, carga
     FROM sessoes_treino
     WHERE atleta_id = $1
       AND data_treino >= NOW() - INTERVAL '28 days'
     ORDER BY data_treino`,
    [atletaId]
  );

  const { rows: perfil } = await pool.query(
    'SELECT idade, peso, historico_lesoes FROM atleta_perfil WHERE usuario_id = $1',
    [atletaId]
  );

  if (treinos.length === 0) {
    return { analise: null, treinos };
  }

  let ultimoErro;
  const urlsServicoIA = obterUrlsServicoIA();

  for (const baseUrl of urlsServicoIA) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), IA_SERVICE_TIMEOUT_MS);

    try {
      const resposta = await fetch(`${baseUrl}/analisar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          atleta_id: atletaId,
          treinos,
          perfil: perfil[0] || {},
        }),
        signal: controller.signal,
      });

      const texto = await resposta.text();
      let dados = {};

      if (texto) {
        try {
          dados = JSON.parse(texto);
        } catch {
          throw new Error(`Resposta inválida do serviço IA em ${baseUrl}: ${texto}`);
        }
      }

      if (!resposta.ok) {
        const detalhe = dados.erro || dados.detail || texto || `HTTP ${resposta.status}`;
        throw new Error(`Serviço IA respondeu com erro em ${baseUrl}: ${detalhe}`);
      }

      // Persiste o resultado no atleta_perfil para uso no listar()
      // Isso evita chamar a IA para cada atleta na listagem
      await pool.query(
        `UPDATE atleta_perfil
         SET acwr          = $1,
             nivel_risco   = $2,
             carga_aguda   = $3,
             carga_cronica = $4,
             analise_em    = NOW()
         WHERE usuario_id = $5`,
        [
          dados.acwr ?? null,
          dados.nivel_risco ?? null,
          dados.carga_aguda_media ?? null,
          dados.carga_cronica_media ?? null,
          atletaId,
        ]
      );

      return { analise: dados, treinos };
    } catch (err) {
      ultimoErro = err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw new Error(ultimoErro?.message || 'Não foi possível conectar ao serviço IA');
}

// ----------------------------------------------------------
// listar — somente técnico, vê apenas seus atletas vinculados
// Corrigido com LEFT JOIN para listar mesmo atletas sem perfil completo
// ----------------------------------------------------------
const listar = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT 
        a.id, 
        a.nome, 
        a.email, 
        ap.idade, 
        ap.peso, 
        ap.historico_lesoes,
        ap.acwr,
        COALESCE(ap.nivel_risco, 'sem dados') AS nivel_risco, -- Garante um texto padrão se for nulo
        ap.carga_aguda,
        ap.carga_cronica,
        ap.analise_em
       FROM usuarios a
       JOIN tecnico_atleta ta ON ta.atleta_id = a.id
       LEFT JOIN atleta_perfil ap ON ap.usuario_id = a.id -- Mudado para LEFT JOIN
       WHERE ta.tecnico_id = $1 AND a.perfil = 'atleta'`,
      [req.usuario.id]
    );
    res.json({ atletas: rows });
  } catch (error) {
    console.error('Erro na query listar atletas:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// ----------------------------------------------------------
// buscarPorId — atleta vê só o próprio perfil; técnico vê qualquer
// atleta seu (RF03)
// ----------------------------------------------------------
const buscarPorId = async (req, res) => {
  const { id } = req.params;

  const idNumerico = parseInt(id);

  // Atleta só pode ver seus próprios dados
  if (req.usuario.perfil === 'atleta' && req.usuario.id !== idNumerico) {
    return res.status(403).json({ erro: 'Acesso negado' });
  }

  if (req.usuario.perfil === 'tecnico') {
    const { rows: vinculo } = await pool.query(
      'SELECT 1 FROM tecnico_atleta WHERE tecnico_id = $1 AND atleta_id = $2',
      [req.usuario.id, idNumerico]
    );

    if (vinculo.length === 0) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }
  }

  const { rows } = await pool.query(
    `SELECT 
      u.id, 
      u.nome, 
      u.email, 
      ap.idade, 
      ap.peso,
      ap.modalidade, 
      ap.historico_lesoes,
      ap.acwr, AS acwr_cache,
      ap.nivel_risco AS nivel_risco_cache,
     FROM usuarios u
     LEFT JOIN atleta_perfil ap ON ap.usuario_id = u.id
     WHERE u.id = $1`,
    [idNumerico]
  );

  if (rows.length === 0) {
    return res.status(404).json({ erro: 'Atleta não encontrado' });
  }

  try {
    const { analise, treinos } = await analisarAtleta(idNumerico);

    const atleta = {
      ...rows[0],
      acwr: analise?.acwr ?? rows[0].acwr_cache ?? null,
      nivel_risco: analise?.nivel_risco ?? rows[0].nivel_risco_cache ?? 'sem dados',
      mensagem: analise?.mensagem ?? 'Nenhuma análise disponível no momento.',
      carga_aguda: analise?.carga_aguda ?? analise?.carga_aguda_media ?? null,
      carga_cronica: analise?.carga_cronica ?? analise?.carga_cronica_media ?? null,
      treinos,
    };
    
    // Remove os campos temporários de cache do objeto de resposta para evitar confusão no frontend
    delete atleta.acwr_cache;
    delete atleta.nivel_risco_cache;

    res.json({ atleta });
  } catch (err) {
    console.error('Erro ao montar detalhe do atleta:', err.message);

    const atleta = {
      ...rows[0],
      acwr: rows[0].acwr_cache ?? null,
      nivel_risco: rows[0].nivel_risco_cache ?? 'sem dados',
      mensagem: 'Não foi possível carregar a análise detalhada.',
      carga_aguda: null,
      carga_cronica: null,
      treinos: [],
    };

    delete atleta.acwr_cache;
    delete atleta.nivel_risco_cache;

    res.json({ atleta });
  }
};

// ----------------------------------------------------------
// criar — RF08
// Cria atleta com senha temporária e flag senha_provisoria
// ----------------------------------------------------------
const criar = async (req, res) => {
  const { nome, email, idade, peso, modalidade, historico_lesoes } = req.body;
  const senhaTemporaria = crypto.randomBytes(6).toString('base64url');
  const senhaHash = await require('bcrypt').hash(senhaTemporaria, 12);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Cria o usuário com perfil atleta
    const { rows: usuario } = await client.query(
      `INSERT INTO usuarios (nome, email, senha_hash, perfil, senha_provisoria)
       VALUES ($1, $2, $3, 'atleta', true)
       RETURNING id`,
      [nome, email, senhaHash]
    );

    const atletaId = usuario[0].id;

    // Cria o perfil físico do atleta — RF10
    await client.query(
      `INSERT INTO atleta_perfil (usuario_id, idade, peso, modalidade, historico_lesoes)
       VALUES ($1, $2, $3, $4, $5)`,
      [atletaId, idade, peso, modalidade || null, historico_lesoes || '']
    );

    await client.query(
      `INSERT INTO tecnico_atleta (tecnico_id, atleta_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [req.usuario.id, atletaId]
    );

    await client.query('COMMIT');
    res.status(201).json({
      mensagem: 'Atleta criado e vinculado com sucesso',
      atletaId,
      senha_temporaria: senhaTemporaria,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// ----------------------------------------------------------
// atualizar — RF10
// ----------------------------------------------------------
const atualizar = async (req, res) => {
  const { id } = req.params;
  const { idade, peso, modalidade, historico_lesoes } = req.body;

  // Atleta só pode atualizar seus próprios dados
  if (req.usuario.perfil === 'atleta' && req.usuario.id !== parseInt(id)) {
    return res.status(403).json({ erro: 'Acesso negado' });
  }

  await pool.query(
    `UPDATE atleta_perfil
     SET idade = COALESCE($1, idade),
         peso = COALESCE($2, peso),
         modalidade = COALESCE($3, modalidade),
         historico_lesoes = COALESCE($4, historico_lesoes),
         atualizado_em = NOW()
     WHERE usuario_id = $5`,
    [idade, peso, modalidade, historico_lesoes, id]
  );

  res.json({ mensagem: 'Dados atualizados com sucesso' });
};

// ----------------------------------------------------------
// vincular / desvincular — RF04
// ----------------------------------------------------------
const vincular = async (req, res) => {
  const { id: atletaId } = req.params;

  const { rows } = await pool.query(
    'SELECT id FROM usuarios WHERE id = $1 AND perfil = $2',
    [atletaId, 'atleta']
  );

  if (rows.length === 0) {
    return res.status(404).json({ erro: 'Atleta não encontrado' });
  }

  await pool.query(
    `INSERT INTO tecnico_atleta (tecnico_id, atleta_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [req.usuario.id, atletaId]
  );

  res.json({ mensagem: 'Atleta vinculado com sucesso' });
};

const desvincular = async (req, res) => {
  const { id: atletaId } = req.params;

  await pool.query(
    'DELETE FROM tecnico_atleta WHERE tecnico_id = $1 AND atleta_id = $2',
    [req.usuario.id, atletaId]
  );

  res.json({ mensagem: 'Atleta desvinculado com sucesso' });
};

// ----------------------------------------------------------
// mapaCorporal — GET /atletas/:id/mapa-corporal
// Gera regiões de risco a partir do nivel_risco e historico_lesoes
// sem depender do serviço IA (Opção A — lógica no controller)
// ----------------------------------------------------------

const REGIOES_POR_TERMO = [
  { termo: ['joelho'], nome: 'Joelho', x: 50, y: 72 },
  { termo: ['coxa','quad'], nome: 'Coxa / Quadríceps', x: 50, y: 60 },
  { termo: ['posterior'], nome: 'Posterior de Coxa', x: 50, y: 58 },
  { termo: ['panturrilha', 'tornozelo'], nome: 'Panturrilha / Tornozelo', x: 48, y: 80 },
  { termo: ['ombro'], nome: 'Ombro', x: 35, y: 30 },
  { termos: ['lombar', 'coluna', 'costas'], nome: 'Lombar / Coluna', x: 50, y: 45 },
  { termos: ['quadril'],      nome: 'Quadril',          x: 50, y: 52 },
  { termos: ['cotovelo', 'pulso'], nome: 'Cotovelo / Pulso', x: 28, y: 50 },
];

const mapaCorporal = async (req, res) => {
  const { id } = req.params;
  const idNumerico = parseInt(id);

  // Reutiliza a lógica de acesso do buscarPorId
  if (req.usuario.perfil === 'atleta' && req.usuario.id !== idNumerico) {
    return res.status(403).json({ erro: 'Acesso negado' });
  }

  if (req.usuario.perfil === 'tecnico') {
    const { rows: vinculo } = await pool.query(
      'SELECT 1 FROM tecnico_atleta WHERE tecnico_id = $1 AND atleta_id = $2',
      [req.usuario.id, idNumerico]
    );
    if (vinculo.length === 0) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }
  }

  const { rows } = await pool.query(
    `SELECT ap.nivel_risco, ap.historico_lesoes, ap.acwr
     FROM atleta_perfil ap
     WHERE ap.usuario_id = $1`,
    [idNumerico]
  );
  
  // Lógica para gerar o mapa corporal com base no nível de risco e histórico de lesões
  // ...

  if (rows.length === 0) {
    return res.status(404).json({ erro: 'Perfil do atleta não encontrado' });
  }

  const { historico_lesoes = '', nivel_risco = 'baixo' } = rows[0];
  const historicoLower = (historico_lesoes || '').toLowerCase();

  //Mapeia termos do histórico de lesões para regiões do corpo
  const regioesMapeadas = REGIOES_POR_TERMO
    .filter(({ termo }) => termo.some(t => historicoLower.includes(t)))
    .map(( regiao, idx) => ({
      id: idx + 1,
      nome: regiao.nome,
      descricao: `Historico de lesão registrado nesta região`,
      nivel: nivel_risco,
      x: regiao.x,
      y: regiao.y
    }));

    // Se não há um histórico mapeável mas o risco é alto/moderado,
    // retorna uma região genérica para o mapa não ficar vazio
    const regioes = regioesMapeadas.length > 0
     ? regioesMapeadas
     : nivel_risco === 'alto' || nivel_risco === 'moderado'
      ? [{
        id: 1,
        nome: 'Sobrecarga Geral',
        descricao: 'Risco detectado sem região específica no histórico',
        nivel: nivel_risco,
        x: 50,
        y: 50,
      }]
    : [];

  const alertas = regioes.map((r, idx) => ({
    id: idx + 1,
    area: r.nome,
    descricao: r.descricao,
    nivel: r.nivel,
  }));

  res.json({ regioes, alertas });
};

module.exports = { 
  listar,
  buscarPorId,
  criar,
  atualizar,
  vincular,
  desvincular,
  mapaCorporal,
};
