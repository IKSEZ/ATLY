
const express = require('express');
const router = express.Router();
const { cadastrar, login, logout, definirSenha } = require('../controllers/auth.controller');
const { autenticar } = require('../middlewares/auth.middleware');

router.post('/cadastro', cadastrar);

router.post('/login', login);

router.post('/logout', autenticar, logout);

router.post('/definir-senha', autenticar, definirSenha);

module.exports = router;
