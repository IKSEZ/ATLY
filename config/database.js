// ============================================================
// config/database.js — conexão com o PostgreSQL
// Suporta DATABASE_URL (Railway/produção) ou variáveis separadas (local)
// ============================================================

const { Pool } = require('pg');

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // obrigatório no Railway
    })
  : new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'atly_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'saory',
    });

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('Conectado ao PostgreSQL com sucesso');
    client.release();
  } catch (err) {
    console.error('Erro ao conectar ao banco:', err.message);
    process.exit(1);
  }
};

module.exports = { pool, connectDB };