# Atly API — Back-end

API REST do sistema Atly, desenvolvida com Node.js + Express + PostgreSQL.

## Estrutura de pastas

```
src/
├── server.js              # Ponto de entrada — inicia o servidor
├── app.js                 # Configuração do Express (middlewares e rotas)
├── config/
│   └── database.js        # Conexão com PostgreSQL
├── middlewares/
│   └── auth.middleware.js # Verificação JWT e controle de acesso (RBAC)
├── routes/
│   ├── auth.routes.js     # /api/v1/auth
│   ├── atleta.routes.js   # /api/v1/atletas
│   ├── treino.routes.js   # /api/v1/treinos
│   └── relatorio.routes.js# /api/v1/relatorios
└── controllers/
    ├── auth.controller.js     # Cadastro, login, logout
    ├── atleta.controller.js   # CRUD de atletas
    ├── treino.controller.js   # Registro e análise de treinos
    └── relatorio.controller.js# Dados para gráficos
```

## Como rodar

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.example .env
# Edite o .env com suas credenciais
```

### 3. Criar o banco de dados
```bash
psql -U postgres -c "CREATE DATABASE atly_db;"
psql -U postgres -d atly_db -f schema.sql
```

### 4. Iniciar em modo desenvolvimento
```bash
npm run dev
```

## Principais endpoints

| Método | Rota | Descrição | RF |
|--------|------|-----------|----|
| POST | /api/v1/auth/cadastro | Cadastra usuário | RF01 |
| POST | /api/v1/auth/login | Autentica e retorna token | RF02 |
| POST | /api/v1/auth/logout | Invalida o token | RF07 |
| GET | /api/v1/atletas | Lista atletas (técnico) | RF03 |
| POST | /api/v1/atletas | Cadastra atleta | RF08 |
| POST | /api/v1/treinos | Registra sessão de treino | RF09 |
| GET | /api/v1/treinos/atleta/:id/analise | Análise de risco via IA | RF11–RF13 |
| GET | /api/v1/relatorios/atleta/:id/desempenho | Dados para gráficos | RF14 |

## Segurança implementada

- Senhas com bcrypt (salt rounds = 12) — RNF02
- Tokens JWT com expiração de 8h / 30d — RNF03
- Bloqueio após 5 tentativas de login — RF05
- Rate limiting global (100 req/15min)
- Headers de segurança via Helmet — RNF01
- Logout com invalidação de token no banco — RF07
- Controle de acesso por perfil (RBAC) — RF03
