# Atly —


## Como rodar

### 1. Instalar dependências
```bash
npm install
```

### 2. Iniciar em modo desenvolvimento
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
