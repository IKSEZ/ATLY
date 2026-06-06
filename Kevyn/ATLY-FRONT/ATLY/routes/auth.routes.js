// ============================================================
// routes/auth.routes.js
// Define as URLs do módulo de autenticação
//
// No Express, um "router" é como um mini-app que agrupa rotas
// relacionadas. Depois registramos ele no app.js.
// ============================================================

const express = require('express');
const router = express.Router();
const { cadastrar, login, logout } = require('../controllers/auth.controller');
const { autenticar } = require('../middlewares/auth.middleware');

// POST /api/v1/auth/cadastro — cria novo usuário (RF01)
router.post('/cadastro', cadastrar);

// POST /api/v1/auth/login — autentica e retorna token (RF02)
router.post('/login', login);

// POST /api/v1/auth/logout — invalida o token (RF07)
// "autenticar" é um middleware: roda antes do controller
// Se o token for inválido, já retorna 401 sem chegar no logout
router.post('/logout', autenticar, logout);

module.exports = router;
