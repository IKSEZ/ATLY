// ============================================================
// routes/atleta.routes.js
// Rotas do módulo de atletas — RF03, RF04, RF08, RF10
// ============================================================

const express = require('express');
const router = express.Router();
const { autenticar, autorizar } = require('../middlewares/auth.middleware');
const atletaController = require('../controllers/atleta.controller');

// Todas as rotas abaixo exigem token válido
router.use(autenticar);

// GET /api/v1/atletas — técnico vê todos os seus atletas (RF03)
router.get('/', autorizar('tecnico'), atletaController.listar);

router.get('/buscar-por-email', atletaController.buscarPorEmail);

// GET /api/v1/atletas/:id — atleta vê só o próprio perfil (RF03)
router.get('/:id', atletaController.buscarPorId);

// GET /api/v1/atletas/:id/mapa-corporal — regiões e alertas do mapa corporal
router.get('/:id/mapa-corporal', atletaController.mapaCorporal);

// POST /api/v1/atletas — técnico cadastra atleta (RF08)
router.post('/', autorizar('tecnico'), atletaController.criar);

// PUT /api/v1/atletas/:id — atualiza dados físicos (RF10)
router.put('/:id', atletaController.atualizar);

// POST /api/v1/atletas/:id/vincular — técnico vincula atleta (RF04)
router.post('/:id/vincular', autorizar('tecnico'), atletaController.vincular);

// DELETE /api/v1/atletas/:id/desvincular — RF04
router.delete('/:id/desvincular', autorizar('tecnico'), atletaController.desvincular);

module.exports = router;
