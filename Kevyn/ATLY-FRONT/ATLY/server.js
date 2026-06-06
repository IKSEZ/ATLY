// ============================================================
// server.js — ponto de entrada da aplicação
// Inicia o Express e conecta ao banco de dados
// ============================================================

const app = require('./app');
const { connectDB } = require('./config/database');

const PORT = process.env.PORT || 3000;

// Conecta ao PostgreSQL e sobe o servidor
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor Atly rodando na porta ${PORT}`);
  });
});
