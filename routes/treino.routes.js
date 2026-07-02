
const express = require('express');
const router = express.Router();
const { autenticar, autorizar } = require('../middlewares/auth.middleware');
const treinoController = require('../controllers/treino.controller');

router.use(autenticar);


router.post('/', treinoController.registrar);

router.get('/atleta/:atletaId', treinoController.listarPorAtleta);


router.get('/atleta/:atletaId/analise', treinoController.analisarCarga);

module.exports = router;
