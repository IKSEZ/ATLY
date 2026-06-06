-- Usuários (atletas e técnicos)
CREATE TABLE IF NOT EXISTS usuarios (
  id              SERIAL PRIMARY KEY,
  nome            VARCHAR(100) NOT NULL,
  email           VARCHAR(150) UNIQUE NOT NULL,
  senha_hash      TEXT NOT NULL,
  perfil          VARCHAR(10) NOT NULL CHECK (perfil IN ('atleta', 'tecnico')),
  tentativas_login INT DEFAULT 0,
  bloqueado_ate   TIMESTAMP,
  criado_em       TIMESTAMP DEFAULT NOW()
);

-- Dados físicos dos atletas (separado por LGPD — dados sensíveis de saúde)
CREATE TABLE IF NOT EXISTS atleta_perfil (
  id               SERIAL PRIMARY KEY,
  usuario_id       INT UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
  idade            INT,
  peso             DECIMAL(5,2),
  historico_lesoes TEXT,
  atualizado_em    TIMESTAMP DEFAULT NOW()
);

-- Vínculo técnico ↔ atleta
CREATE TABLE IF NOT EXISTS tecnico_atleta (
  tecnico_id  INT REFERENCES usuarios(id) ON DELETE CASCADE,
  atleta_id   INT REFERENCES usuarios(id) ON DELETE CASCADE,
  vinculado_em TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (tecnico_id, atleta_id)
);

-- Sessões de treino registradas
CREATE TABLE IF NOT EXISTS sessoes_treino (
  id           SERIAL PRIMARY KEY,
  atleta_id    INT REFERENCES usuarios(id) ON DELETE CASCADE,
  intensidade  INT NOT NULL CHECK (intensidade BETWEEN 1 AND 10),
  duracao_min  INT NOT NULL,
  volume       DECIMAL(8,2) NOT NULL,
  carga        DECIMAL(10,1), -- intensidade × duração
  tipo         VARCHAR(50),
  data_treino  TIMESTAMP DEFAULT NOW()
);

-- Alertas de risco gerados pelo módulo de IA
CREATE TABLE IF NOT EXISTS alertas (
  id         SERIAL PRIMARY KEY,
  atleta_id  INT REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo       VARCHAR(50),
  mensagem   TEXT,
  criado_em  TIMESTAMP DEFAULT NOW()
);

-- Tokens invalidados (logout explícito — RF07)
CREATE TABLE IF NOT EXISTS tokens_invalidados (
  token        TEXT PRIMARY KEY,
  invalidado_em TIMESTAMP DEFAULT NOW()
);

-- Índices para performance nas queries mais frequentes
CREATE INDEX IF NOT EXISTS idx_treinos_atleta_data
  ON sessoes_treino(atleta_id, data_treino DESC);

CREATE INDEX IF NOT EXISTS idx_alertas_atleta
  ON alertas(atleta_id, criado_em DESC);