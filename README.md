# Sistema de Gerenciamento de Leads Agrícolas

Sistema completo de CRUD para gerenciamento de leads e propriedades rurais.

## Instalação e Execução

### Pré-requisitos

- Node.js 18+ e npm
- Docker e Docker Compose

### 1. Clonar o Repositório

```bash
git clone <url-do-repositorio>
cd challengeTmDigital
```

### 2. Configurar e Iniciar o Backend

```bash
# Navegar para a pasta do backend
cd backend

# Criar arquivo .env com as configurações do banco de dados
# Crie um arquivo chamado .env na pasta backend com o seguinte conteúdo:
# NODE_ENV=development
# PORT=3000
# DB_HOST=localhost
# DB_PORT=5433
# DB_USER=postgres
# DB_PASSWORD=postgres
# DB_NAME=nestjs_db

# Instalar dependências
npm install

# Iniciar banco de dados PostgreSQL com Docker
docker-compose up -d

# Aguardar ~10 segundos para o banco inicializar

# Iniciar o servidor em modo desenvolvimento
npm run start:dev
```

O backend estará rodando em: http://localhost:3000

### 3. Configurar e Iniciar o Frontend

Em um novo terminal:

```bash
# Navegar para a pasta do frontend
cd frontend

# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm run start
```

O frontend estará rodando em: http://localhost:4200

### 4. Acessar o Sistema

Abra seu navegador em: http://localhost:4200

Rotas disponíveis:
- /dashboard - Dashboard com métricas e gráficos
- /leads - Gerenciamento de leads
- /propriedades-rurais - Gerenciamento de propriedades
