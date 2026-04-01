// ============================================================
// routes/treino.routes.js
// Registro de sessões de treino — RF09, RF11, RF12, RF13
// ============================================================

const express = require('express');
const router = express.Router();
const { autenticar, autorizar } = require('../middlewares/auth.middleware');
const treinoController = require('../controllers/treino.controller');

router.use(autenticar);

// POST /api/v1/treinos — registra uma sessão de treino (RF09)
router.post('/', treinoController.registrar);

// GET /api/v1/treinos/atleta/:atletaId — histórico do atleta
router.get('/atleta/:atletaId', treinoController.listarPorAtleta);

// GET /api/v1/treinos/atleta/:atletaId/analise — RF11, RF12, RF13
// Chama o módulo Python de IA e retorna o risco calculado
router.get('/atleta/:atletaId/analise', treinoController.analisarCarga);

module.exports = router;
