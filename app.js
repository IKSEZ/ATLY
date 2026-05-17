// ============================================================
// app.js — configuração principal do Express
// Aqui registramos middlewares globais e as rotas da API
// ============================================================

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth.routes');
const atletaRoutes = require('./routes/atleta.routes');
const treinoRoutes = require('./routes/treino.routes');
const relatorioRoutes = require('./routes/relatorio.routes');

const app = express();

// ----------------------------------------------------------
// Middlewares de segurança
// ----------------------------------------------------------

// helmet: adiciona headers HTTP de segurança automaticamente
app.use(helmet());

// cors: permite que o front-end (React) acesse a API
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Parseia JSON no corpo das requisições
app.use(express.json());

// Rate limiting global: limita 100 requisições por IP a cada 15 minutos
// (RF05 exige bloqueio após 5 tentativas de login — isso é feito na rota de auth)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { erro: 'Muitas requisições. Tente novamente em 15 minutos.' },
});
app.use(limiter);

// ----------------------------------------------------------
// Rotas da API
// ----------------------------------------------------------

// Todas as rotas começam com /api/v1 — boa prática para versionar a API
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/atletas', atletaRoutes);
app.use('/api/v1/treinos', treinoRoutes);
app.use('/api/v1/relatorios', relatorioRoutes);

// Rota de health check — útil para saber se a API está no ar
app.get('/health', (req, res) => {
  res.json({ status: 'ok', servico: 'Atly API' });
});

// Middleware de erro global — captura qualquer erro não tratado
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    erro: err.message || 'Erro interno do servidor',
  });
});

module.exports = app;
