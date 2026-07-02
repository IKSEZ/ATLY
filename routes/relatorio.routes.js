
const express = require('express');
const router = express.Router();
const { autenticar } = require('../middlewares/auth.middleware');
const relatorioController = require('../controllers/relatorio.controller');

router.use(autenticar);


router.get('/atleta/:atletaId/desempenho', relatorioController.desempenho);


router.get('/atleta/:atletaId/alertas', relatorioController.alertas);

module.exports = router;
