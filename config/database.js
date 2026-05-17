// ============================================================
// config/database.js — conexão com o PostgreSQL
// Usamos o pacote 'pg' (node-postgres) para conectar
// ============================================================

const { Pool } = require('pg');

// Pool mantém um conjunto de conexões abertas com o banco
// É mais eficiente do que abrir/fechar uma conexão por requisição
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'atly_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'saory',
});

// Função que testa a conexão ao iniciar o servidor
const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('Conectado ao PostgreSQL com sucesso');
    client.release(); // devolve a conexão pro pool
  } catch (err) {
    console.error('Erro ao conectar ao banco:', err.message);
    process.exit(1); // encerra o processo se não conseguir conectar
  }
};

// Exportamos o pool para usar nas queries dos controllers
module.exports = { pool, connectDB };
