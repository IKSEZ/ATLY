
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



app.use(helmet({
  crossOriginResourcePolicy: false,
}));


if (process.env.NODE_ENV !== 'production') {
  app.use(cors({ origin: true, credentials: true }));
} else {
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'https://aatly.netlify.app', 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
}


app.use(express.json());


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { erro: 'Muitas requisições. Tente novamente em 15 minutos.' },
});
app.use(limiter);




app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/atletas', atletaRoutes);
app.use('/api/v1/treinos', treinoRoutes);
app.use('/api/v1/relatorios', relatorioRoutes);


app.get('/health', (req, res) => {
  res.json({ status: 'ok', servico: 'Atly API' });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    erro: err.message || 'Erro interno do servidor',
  });
});

module.exports = app;
