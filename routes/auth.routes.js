// ============================================================
// routes/auth.routes.js
// ============================================================

const express = require('express');
const router = express.Router();
const { cadastrar, login, logout, definirSenha } = require('../controllers/auth.controller');
const { autenticar } = require('../middlewares/auth.middleware');

// POST /api/v1/auth/cadastro — cria novo usuário (RF01)
router.post('/cadastro', cadastrar);

// POST /api/v1/auth/login — autentica e retorna token (RF02)
router.post('/login', login);

// POST /api/v1/auth/logout — invalida o token (RF07)
router.post('/logout', autenticar, logout);

// POST /api/v1/auth/definir-senha — primeiro acesso: troca senha temporária
// Exige token válido (atleta já fez login com a senha temporária)
router.post('/definir-senha', autenticar, definirSenha);

module.exports = router;