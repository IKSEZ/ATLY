// ============================================================
// routes/relatorio.routes.js
// Relatórios e gráficos de desempenho — RF14
// ============================================================

const express = require('express');
const router = express.Router();
const { autenticar } = require('../middlewares/auth.middleware');
const relatorioController = require('../controllers/relatorio.controller');

router.use(autenticar);

// GET /api/v1/relatorios/atleta/:atletaId/desempenho
// Retorna dados agregados para exibir gráficos no front-end
router.get('/atleta/:atletaId/desempenho', relatorioController.desempenho);

// GET /api/v1/relatorios/atleta/:atletaId/alertas
// Histórico de alertas emitidos — RF13
router.get('/atleta/:atletaId/alertas', relatorioController.alertas);

module.exports = router;
