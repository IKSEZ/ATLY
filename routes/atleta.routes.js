const express = require('express');
const router = express.Router();
const { autenticar } = require('../middlewares/auth.middleware');
const atletaController = require('../controllers/atleta.controller');

router.use(autenticar);

// Suas rotas existentes...
router.get('/', atletaController.listar);
router.get('/:id', atletaController.buscarPorId);
router.post('/', atletaController.criar);
router.put('/:id', atletaController.atualizar);

// CORREÇÃO CRÍTICA: A rota de e-mail que o seu formulário React vai disparar
router.post('/vincular-atleta', atletaController.vincularAtletaPorEmail);

// Suas rotas antigas de ID caso queira manter compatibilidade
router.post('/:id/vincular', atletaController.vincular);
router.delete('/:id/desvincular', atletaController.desvincular);
router.get('/:id/mapa-corporal', atletaController.mapaCorporal);

module.exports = router;