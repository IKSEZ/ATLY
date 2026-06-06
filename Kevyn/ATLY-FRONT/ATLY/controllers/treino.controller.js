// ============================================================
// controllers/treino.controller.js
// Registro e análise de treinos — RF09, RF11, RF12, RF13
// ============================================================

const { pool } = require('../config/database');

// ----------------------------------------------------------
// Funções de cálculo
// ----------------------------------------------------------
function calcularCarga(intensidade, duracao_min) {
  return Number(intensidade) * Number(duracao_min);
}

function calcularMedia(lista) {
  if (!lista || lista.length === 0) return 0;

  const soma = lista.reduce((total, item) => {
    return total + Number(item.carga);
  }, 0);

  return soma / lista.length;
}

function calcularACWR(cargaAguda, cargaCronica) {
  if (cargaCronica === 0) return 0;
  return cargaAguda / cargaCronica;
}

function classificarRisco(acwr) {
  if (acwr === 0) {
    return {
      nivel_risco: 'sem_dados',
      mensagem: 'Ainda não há dados suficientes para calcular o risco.'
    };
  }

  if (acwr < 0.8) {
    return {
      nivel_risco: 'baixo',
      mensagem: 'Carga abaixo do ideal. Atenção para perda de condicionamento.'
    };
  }

  if (acwr <= 1.3) {
    return {
      nivel_risco: 'seguro',
      mensagem: 'Carga dentro da zona segura.'
    };
  }

  if (acwr <= 1.5) {
    return {
      nivel_risco: 'atencao',
      mensagem: 'Atenção: aumento de carga acima do recomendado.'
    };
  }

  return {
    nivel_risco: 'alto',
    mensagem: 'Alto risco de sobrecarga. Recomenda-se reduzir a intensidade dos treinos.'
  };
}

// ----------------------------------------------------------
// registrar — RF09
// ----------------------------------------------------------
const registrar = async (req, res) => {
  try {
    const { atleta_id, intensidade, duracao_min, volume, data_treino, tipo } = req.body;

    if (req.usuario.perfil === 'atleta' && req.usuario.id !== Number(atleta_id)) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    if (!atleta_id || !intensidade || !duracao_min) {
      return res.status(400).json({
        erro: 'atleta_id, intensidade e duracao_min são obrigatórios'
      });
    }

    const carga = calcularCarga(intensidade, duracao_min);

    const { rows } = await pool.query(
      `INSERT INTO sessoes_treino
        (atleta_id, intensidade, duracao_min, volume, carga, tipo, data_treino)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        atleta_id,
        intensidade,
        duracao_min,
        volume || null,
        carga,
        tipo || null,
        data_treino || new Date()
      ]
    );

    res.status(201).json({
      mensagem: 'Treino registrado com sucesso',
      treino: rows[0]
    });

  } catch (error) {
    res.status(500).json({
      erro: 'Erro ao registrar treino',
      detalhe: error.message
    });
  }
};

// ----------------------------------------------------------
// listarPorAtleta
// ----------------------------------------------------------
const listarPorAtleta = async (req, res) => {
  try {
    const { atletaId } = req.params;

    if (req.usuario.perfil === 'atleta' && req.usuario.id !== Number(atletaId)) {
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

  } catch (error) {
    res.status(500).json({
      erro: 'Erro ao listar treinos',
      detalhe: error.message
    });
  }
};

// ----------------------------------------------------------
// analisarCarga — RF11, RF12, RF13
// ----------------------------------------------------------
const analisarCarga = async (req, res) => {
  try {
    const { atletaId } = req.params;

    if (req.usuario.perfil === 'atleta' && req.usuario.id !== Number(atletaId)) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    const { rows: treinos } = await pool.query(
      `SELECT id, data_treino, carga
       FROM sessoes_treino
       WHERE atleta_id = $1
         AND data_treino >= NOW() - INTERVAL '28 days'
       ORDER BY data_treino DESC`,
      [atletaId]
    );

    const hoje = new Date();

    const ultimos7Dias = treinos.filter((treino) => {
      const dataTreino = new Date(treino.data_treino);
      const diferencaDias = (hoje - dataTreino) / (1000 * 60 * 60 * 24);
      return diferencaDias <= 7;
    });

    const ultimos28Dias = treinos.filter((treino) => {
      const dataTreino = new Date(treino.data_treino);
      const diferencaDias = (hoje - dataTreino) / (1000 * 60 * 60 * 24);
      return diferencaDias <= 28;
    });

    const cargaAguda = calcularMedia(ultimos7Dias);
    const cargaCronica = calcularMedia(ultimos28Dias);
    const acwr = calcularACWR(cargaAguda, cargaCronica);

    const resultado = classificarRisco(acwr);

    const analise = {
      atleta_id: Number(atletaId),
      carga_aguda: Number(cargaAguda.toFixed(2)),
      carga_cronica: Number(cargaCronica.toFixed(2)),
      acwr: Number(acwr.toFixed(2)),
      nivel_risco: resultado.nivel_risco,
      mensagem: resultado.mensagem
    };

    if (resultado.nivel_risco === 'alto' || resultado.nivel_risco === 'atencao') {
      await pool.query(
        `INSERT INTO alertas (atleta_id, tipo, mensagem, criado_em)
         VALUES ($1, $2, $3, NOW())`,
        [atletaId, 'sobrecarga', resultado.mensagem]
      );
    }

    res.json({ analise });

  } catch (error) {
    res.status(500).json({
      erro: 'Erro ao analisar carga',
      detalhe: error.message
    });
  }
};

module.exports = {
  registrar,
  listarPorAtleta,
  analisarCarga
};