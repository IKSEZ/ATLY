
const express = require('express');
const router = express.Router();
const { autenticar, autorizar } = require('../middlewares/auth.middleware');
const atletaController = require('../controllers/atleta.controller');


router.use(autenticar);


router.get('/', autorizar('tecnico'), atletaController.listar);


router.get('/:id', atletaController.buscarPorId);

router.get('/:id/mapa-corporal', atletaController.mapaCorporal);

router.post('/', autorizar('tecnico'), atletaController.criar);


router.put('/:id', atletaController.atualizar);

router.post('/:id/vincular', autorizar('tecnico'), atletaController.vincular);

router.delete('/:id/desvincular', autorizar('tecnico'), atletaController.desvincular);

module.exports = router;
