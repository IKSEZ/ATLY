// ============================================================
// controllers/atleta.controller.js
// CRUD de atletas com controle de acesso por perfil — RF03, RF08, RF10
// ============================================================

const { pool } = require('../config/database');

// ----------------------------------------------------------
// listar — somente técnico, vê apenas seus atletas vinculados
// ----------------------------------------------------------
const listar = async (req, res) => {
  const { rows } = await pool.query(
    `SELECT a.id, a.nome, a.email, ap.idade, ap.peso, ap.historico_lesoes
     FROM usuarios a
     JOIN tecnico_atleta ta ON ta.atleta_id = a.id
     JOIN atleta_perfil ap ON ap.usuario_id = a.id
     WHERE ta.tecnico_id = $1 AND a.perfil = 'atleta'`,
    [req.usuario.id]
  );
  res.json({ atletas: rows });
};

// ----------------------------------------------------------
// buscarPorId — atleta vê só o próprio perfil; técnico vê qualquer
// atleta seu (RF03)
// ----------------------------------------------------------
const buscarPorId = async (req, res) => {
  const { id } = req.params;

  // Atleta só pode ver seus próprios dados
  if (req.usuario.perfil === 'atleta' && req.usuario.id !== parseInt(id)) {
    return res.status(403).json({ erro: 'Acesso negado' });
  }

  const { rows } = await pool.query(
    `SELECT u.id, u.nome, u.email, ap.idade, ap.peso, ap.historico_lesoes
     FROM usuarios u
     JOIN atleta_perfil ap ON ap.usuario_id = u.id
     WHERE u.id = $1`,
    [id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ erro: 'Atleta não encontrado' });
  }

  res.json({ atleta: rows[0] });
};

// ----------------------------------------------------------
// criar — RF08
// ----------------------------------------------------------
const criar = async (req, res) => {
  const { nome, email, idade, peso, historico_lesoes } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Cria o usuário com perfil atleta
    const { rows: usuario } = await client.query(
      `INSERT INTO usuarios (nome, email, senha_hash, perfil)
       VALUES ($1, $2, $3, 'atleta')
       RETURNING id`,
      [nome, email, 'senha_temporaria_hash'] // em produção: enviar e-mail para o atleta definir senha
    );

    const atletaId = usuario[0].id;

    // Cria o perfil físico do atleta — RF10
    await client.query(
      `INSERT INTO atleta_perfil (usuario_id, idade, peso, historico_lesoes)
       VALUES ($1, $2, $3, $4)`,
      [atletaId, idade, peso, historico_lesoes || '']
    );

    await client.query('COMMIT');
    res.status(201).json({ mensagem: 'Atleta criado com sucesso', atletaId });
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
  const { idade, peso, historico_lesoes } = req.body;

  // Atleta só pode atualizar seus próprios dados
  if (req.usuario.perfil === 'atleta' && req.usuario.id !== parseInt(id)) {
    return res.status(403).json({ erro: 'Acesso negado' });
  }

  await pool.query(
    `UPDATE atleta_perfil
     SET idade = COALESCE($1, idade),
         peso = COALESCE($2, peso),
         historico_lesoes = COALESCE($3, historico_lesoes),
         atualizado_em = NOW()
     WHERE usuario_id = $4`,
    [idade, peso, historico_lesoes, id]
  );

  res.json({ mensagem: 'Dados atualizados com sucesso' });
};

// ----------------------------------------------------------
// vincular / desvincular — RF04
// ----------------------------------------------------------
const vincular = async (req, res) => {
  const { id: atletaId } = req.params;

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

module.exports = { listar, buscarPorId, criar, atualizar, vincular, desvincular };
