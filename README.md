# AstroCode — Sistema de Agendamento de Serviços

> Plataforma full-stack para agendamento online de serviços. Profissionais cadastram seus horários, serviços e perfil; clientes buscam, comparam e reservam horários disponíveis — com ou sem cadastro.

[![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular)](https://angular.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)

---

## 📑 Índice

- [Quick Start (< 5 minutos)](#-quick-start--5-minutos)
- [Guia de Testes para o Entrevistador](#-guia-de-testes-para-o-entrevistador)
- [Features](#-features)
- [Arquitetura](#-arquitetura)
- [Stack Tecnológica](#stack-tecnológica)
- [Diagrama ER](#-diagrama-er)
- [Fluxos da Aplicação](#-fluxos-da-aplicação)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Endpoints da API](#-endpoints-da-api)
- [Variáveis de Ambiente](#️-variáveis-de-ambiente)
- [Testes Automatizados](#-testes-automatizados)
- [Deploy em Produção](#-deploy-em-produção)
- [Coleção Postman](#-coleção-postman)
- [Comandos Úteis](#-comandos-úteis)
- [Decisões Técnicas](#-decisões-técnicas)

---

## 🚀 Quick Start (< 5 minutos)

### Pré-requisitos

| Ferramenta         | Versão mínima | Verificar instalação     |
| ------------------ | ------------- | ------------------------ |
| **Docker**         | 20+           | `docker --version`       |
| **Docker Compose** | v2+           | `docker compose version` |
| **Git**            | 2.x           | `git --version`          |

> **Nota:** Não é necessário ter Python, Node.js ou banco de dados instalados — tudo roda via Docker.

### Passo a Passo

```bash
# 1. Clone o repositório
git clone https://github.com/felipe-gomes0/astrocode-teste.git
cd astrocode-teste

# 2. Crie o arquivo de variáveis de ambiente
cp .env.example .env
```

**3. Preencha o `.env`** com os valores abaixo (valores mínimos para rodar localmente):

```env
# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=astrocode
DATABASE_URL=postgresql://postgres:postgres@db:5432/astrocode
SECRET_KEY=uma_chave_secreta_qualquer_com_32_chars

# MongoDB (Logs)
MONGO_ROOT_USER=root
MONGO_ROOT_PASSWORD=rootpass
LOG_MONGO_USER=log_service
LOG_MONGO_PASSWORD=logpass
LOG_DB_NAME=app_logs
LOG_LEVEL=info
LOG_MONGO_URI=mongodb://log_service:logpass@mongodb:27017/app_logs?authSource=app_logs

# Opcionais (funcionalidades extras)
EMAILS_ENABLED=false
ENVIRONMENT=development
BACKEND_CORS_ORIGINS=["http://localhost:4200"]
FRONTEND_URL=http://localhost:4200
```

> ⚠️ **Serviços opcionais:** Cloudinary (upload de fotos) e Resend (envio de emails) funcionam sem configuração — apenas as features correspondentes ficam desabilitadas.

```bash
# 4. Suba todos os containers
docker compose up --build

# 5. Aguarde até ver no terminal:
#    backend   | INFO:     Uvicorn running on http://0.0.0.0:8000
#    frontend  | ✔ Compiled successfully.

# 6. Em outro terminal, popule o banco com dados de teste
docker compose exec backend python -m app.initial_data
```

### ✅ Acessos após o setup

| Serviço          | URL                                                          | Descrição                        |
| ---------------- | ------------------------------------------------------------ | -------------------------------- |
| **Frontend**     | [http://localhost:4200](http://localhost:4200)               | Interface web (Angular)          |
| **API Swagger**  | [http://localhost:8000/docs](http://localhost:8000/docs)     | Documentação interativa da API   |
| **API ReDoc**    | [http://localhost:8000/redoc](http://localhost:8000/redoc)   | Documentação alternativa (ReDoc) |
| **Health Check** | [http://localhost:8000/health](http://localhost:8000/health) | Status do backend                |
| **PostgreSQL**   | `localhost:5432`                                             | Conexão direta ao banco          |
| **MongoDB**      | `localhost:27017`                                            | Acesso ao banco de logs          |

---

## 🎯 Guia de Testes para o Entrevistador

Este guia é pensado para que o avaliador consiga testar **todos os aspectos do sistema** de forma prática.

### Contas de Teste (pré-configuradas no seed)

| Email                         | Senha         | Tipo         | Perfil                                            |
| ----------------------------- | ------------- | ------------ | ------------------------------------------------- |
| `prof@example.com`            | `password123` | Profissional | Barbeiro — 4 serviços, Seg-Sex 09-18h, Sáb 09-13h |
| `ana.dentista@example.com`    | `password123` | Profissional | Dentista — 3 serviços, Seg-Qui 08-17h, Sex 08-14h |
| `rafael.personal@example.com` | `password123` | Profissional | Personal Trainer — 3 serviços, Seg-Sáb 06-20h     |
| `carla.psicologa@example.com` | `password123` | Profissional | Psicóloga — 3 serviços, Seg-Sex 10-19h            |
| `client@example.com`          | `password123` | Cliente      | João Silva                                        |
| `maria@example.com`           | `password123` | Cliente      | Maria Oliveira                                    |

### 🧪 Roteiro de Testes Sugerido

#### 1. Fluxo do Cliente (sem login)

```
1. Acesse http://localhost:4200
   → Você será redirecionado para a tela de busca de profissionais

2. Pesquise por "Barber" ou "Dentista" na barra de busca
   → Os profissionais cadastrados devem aparecer com nome, foto e especialidade

3. Clique em um profissional
   → A tela de agendamento abre com calendário, serviços e horários

4. Selecione um serviço, uma data e um horário disponível

5. Ao clicar em "Agendar", um modal aparecerá pedindo nome, email e telefone
   → Este é o fluxo "Guest" para visitantes sem cadastro

6. Preencha os dados e confirme
   → Um agendamento será criado com status "pending"
```

#### 2. Fluxo do Cliente (com login)

```
1. Clique em "Login" e entre com: client@example.com / password123

2. Repita os passos de busca e agendamento
   → Desta vez, o modal Guest NÃO aparece — o agendamento usa seus dados

3. Acesse "Meus Agendamentos" no menu
   → Todos os seus agendamentos aparecem listados com status

4. Acesse "Configurações" no menu
   → Edite seus dados (nome, telefone)
```

#### 3. Fluxo do Profissional

```
1. Faça logout e entre com: prof@example.com / password123
   → Você será redirecionado ao Dashboard do profissional

2. Dashboard — Veja agendamentos recebidos
   → Os agendamentos criados nos passos anteriores devem aparecer
   → Teste alterar o status (Confirmar, Cancelar, Concluir)

3. Gerenciar Serviços (/professional/services)
   → Crie um novo serviço (ex: "Hidratação", R$40, 30min)
   → Edite um serviço existente
   → Desative/remova um serviço

4. Gerenciar Bloqueios (/professional/blocks)
   → Crie um bloqueio de data/hora (ex: feriado)
   → Verifique que o horário bloqueado não aparece no agendamento

5. Configurações (/professional/settings)
   → Edite expediente (horários por dia da semana)
   → Edite descrição, endereço e foto de perfil (Cloudinary, se configurado)
```

#### 4. Testando a API diretamente (Swagger)

```
1. Acesse http://localhost:8000/docs
   → Swagger com todos os endpoints documentados

2. Teste o login:
   POST /api/v1/auth/access-token
   Body (form-data): username=prof@example.com, password=password123
   → Copie o access_token retornado

3. Clique em "Authorize" (cadeado) no topo do Swagger
   → Cole o token no campo "Value" e clique em "Authorize"

4. Agora teste endpoints protegidos:
   GET /api/v1/users/me → Dados do profissional logado
   GET /api/v1/appointments/ → Agendamentos do profissional

5. Teste endpoints públicos (sem auth):
   GET /api/v1/professionals/ → Lista profissionais
   GET /api/v1/professionals/?search=barber → Filtro por especialidade
   GET /api/v1/services/?professional_id=1 → Serviços de um profissional
   GET /api/v1/working-hours/?professional_id=1 → Horários de expediente
```

#### 5. Testes Automatizados

```bash
# Testes unitários do backend (pytest)
docker compose exec backend python -m pytest tests/ -v

# O relatório mostra testes de:
# - Autenticação (login válido/inválido)
# - Criação de usuários
# - Serviço de notificações
```

#### 6. Verificando Logs (MongoDB)

```bash
# Conectar ao MongoDB e visualizar logs de auditoria
docker compose exec mongodb_logs mongosh \
  -u log_service -p logpass --authenticationDatabase app_logs app_logs

# Dentro do mongosh:
db.logs.find().sort({timestamp: -1}).limit(5).pretty()

# Filtrar por ação:
db.logs.find({action: "LOGIN_SUCCESS"}).pretty()
db.logs.find({level: "error"}).pretty()
```

#### 7. Testando com Postman

```
1. Abra o Postman
2. Importe a coleção: postman/collections/Astrocode Teste API.postman_collection.json
3. A variável {{base_url}} já está configurada para http://localhost:8000
4. Execute os requests organizados por grupo (Auth, Users, Professionals, etc.)
```

---

## 🎯 Features

| Feature                     | Descrição                                               | Highlight                                |
| --------------------------- | ------------------------------------------------------- | ---------------------------------------- |
| **Cadastro e Autenticação** | Registro de usuários (clientes e profissionais) com JWT | Token com expiração de 120 min, bcrypt   |
| **Busca de Profissionais**  | Pesquisa pública por nome ou especialidade              | Sem necessidade de login                 |
| **Agendamento Online**      | Clientes logados ou visitantes reservam horários        | Modo "Guest" para visitantes             |
| **Validação de Conflitos**  | Backend valida sobreposição de horários                 | Working hours + bloqueios                |
| **Painel do Profissional**  | Dashboard com agendamentos e gerenciamento              | CRUD de serviços, expedientes, bloqueios |
| **Upload de Foto**          | Profissionais enviam foto de perfil via Cloudinary      | Crop automático, otimização CDN          |
| **Notificações por Email**  | Confirmações automáticas via Resend                     | Template HTML com Jinja2                 |
| **Logs Estruturados**       | Auditoria persistida em MongoDB                         | Login, erros, emails, trace_id           |
| **Docker Compose**          | Ambiente completo com hot reload                        | 4 containers orquestrados                |
| **Deploy Cloud**            | Configuração para Vercel + Railway                      | CI/CD friendly                           |

---

## 🏗 Arquitetura

```mermaid
graph TB
    subgraph "Frontend — Angular 21"
        FE[SPA Angular]
        MAT[Angular Material]
        GUARD[Auth Guards + Interceptors]
    end

    subgraph "Backend — FastAPI"
        API[REST API v1]
        AUTH[JWT Auth — python-jose + bcrypt]
        MW[Middleware — CORS + Logging]
        EMAIL[Email Service — Resend + Jinja2]
        UPLOAD[Upload Service — Cloudinary]
        LOG[Log Service — Motor async]
        VALID[Validation — Pydantic v2]
    end

    subgraph "Bancos de Dados"
        PG[(PostgreSQL 15<br/>SQLAlchemy 2.0 + Alembic)]
        MG[(MongoDB 7.0<br/>Logs de Auditoria)]
    end

    subgraph "Serviços Externos"
        CLD[Cloudinary CDN]
        RS[Resend — Email API]
    end

    FE --> |HTTP/JSON| API
    FE --> MAT
    FE --> GUARD
    API --> AUTH
    API --> MW
    API --> VALID
    API --> PG
    API --> EMAIL
    API --> UPLOAD
    API --> LOG
    LOG --> MG
    EMAIL --> RS
    UPLOAD --> CLD
```

### Stack Tecnológica

| Camada        | Tecnologia       | Versão               | Papel                                   |
| ------------- | ---------------- | -------------------- | --------------------------------------- |
| Frontend      | Angular          | 21+                  | SPA com standalone components           |
| UI Kit        | Angular Material | 21+                  | Componentes visuais (CDK, date-fns)     |
| Backend       | FastAPI          | 0.100+               | API REST assíncrona com lifespan        |
| ORM           | SQLAlchemy       | 2.0                  | Mapeamento objeto-relacional            |
| Migrations    | Alembic          | latest               | Versionamento de schema                 |
| Validação     | Pydantic         | v2                   | Request/Response schemas                |
| DB Relacional | PostgreSQL       | 15 (Alpine)          | Dados de negócio                        |
| DB NoSQL      | MongoDB          | 7.0                  | Logs e auditoria                        |
| Auth          | JWT              | python-jose + bcrypt | Tokens HS256, 120 min                   |
| Emails        | Resend           | latest               | Notificações transacionais              |
| Imagens       | Cloudinary       | latest               | CDN de fotos de perfil                  |
| Infra Local   | Docker Compose   | v2                   | Orquestração de 4 containers            |
| Prod Frontend | Vercel           | -                    | CDN + Static Hosting + Security Headers |
| Prod Backend  | Railway          | -                    | PaaS com PostgreSQL integrado           |

---

## 📊 Diagrama ER

```mermaid
erDiagram
    USERS {
        UUID id PK "UUID v7 (time-ordered)"
        string email UK
        string password "bcrypt hash"
        string name
        string phone
        enum type "professional | client"
        boolean active
        datetime created_at
        datetime updated_at
    }

    PROFESSIONALS {
        int id PK
        UUID user_id FK
        string speciality
        text description
        string photo_url "Cloudinary CDN URL"
        string address
        datetime created_at
    }

    SERVICES {
        int id PK
        int professional_id FK
        string name
        text description
        int duration "em minutos"
        decimal price "DECIMAL para precisão monetária"
        boolean active
    }

    WORKING_HOURS {
        int id PK
        int professional_id FK
        int day_of_week "0-6 (Seg-Dom)"
        time start_time
        time end_time
        boolean active
    }

    BLOCKS {
        int id PK
        int professional_id FK
        datetime start_time
        datetime end_time
        string reason
    }

    APPOINTMENTS {
        int id PK
        int professional_id FK
        UUID client_id FK
        int service_id FK
        datetime date_time
        int duration
        enum status "pending | confirmed | cancelled | completed"
        text notes
        string guest_name "NULL se logado"
        string guest_email "NULL se logado"
        string guest_phone "NULL se logado"
    }

    REVIEWS {
        int id PK
        int appointment_id FK
        UUID client_id FK
        int professional_id FK
        int rating "1-5"
        text comment
    }

    USERS ||--o| PROFESSIONALS : "é"
    PROFESSIONALS ||--o{ SERVICES : "oferece"
    PROFESSIONALS ||--o{ WORKING_HOURS : "tem"
    PROFESSIONALS ||--o{ BLOCKS : "bloqueia"
    PROFESSIONALS ||--o{ APPOINTMENTS : "atende"
    USERS ||--o{ APPOINTMENTS : "agenda"
    SERVICES ||--o{ APPOINTMENTS : "referência"
    APPOINTMENTS ||--o| REVIEWS : "recebe"
    USERS ||--o{ REVIEWS : "escreve"
    PROFESSIONALS ||--o{ REVIEWS : "recebe"
```

---

## 🔄 Fluxos da Aplicação

### Fluxo de Agendamento (Cliente)

```mermaid
flowchart TD
    A[Cliente acessa /client/search] --> B{Busca profissional}
    B --> C[Seleciona profissional]
    C --> D[Visualiza serviços e calendário]
    D --> E[Escolhe serviço + data/hora]
    E --> F{Está logado?}
    F -->|Sim| G[Submete agendamento direto]
    F -->|Não| H[Modal Guest: nome, email, telefone]
    H --> I[Cria conta temporária + agendamento]
    G --> J[Backend valida conflitos]
    I --> J
    J -->|OK| K[Agendamento criado — Status: PENDING]
    J -->|Conflito| L[Erro: horário indisponível]
    K --> M[Email de confirmação via Resend]
    K --> N[Log registrado no MongoDB]
```

### Fluxo do Profissional

```mermaid
flowchart TD
    A[Profissional faz login] --> B[Dashboard /professional/dashboard]
    B --> C{Ação}
    C --> D[Gerenciar Serviços]
    C --> E[Configurar Expediente]
    C --> F[Gerenciar Bloqueios]
    C --> G[Editar Perfil + Foto]

    D --> D1[CRUD de serviços: nome, preço, duração]
    E --> E1[Definir horários por dia da semana — batch save]
    F --> F1[Bloquear períodos no calendário com motivo]
    G --> G1[Upload de foto via Cloudinary — crop + otimização]

    B --> H[Lista de agendamentos]
    H --> I{Ação no agendamento}
    I --> I1[Confirmar → status: confirmed]
    I --> I2[Cancelar → status: cancelled]
    I --> I3[Concluir → status: completed]
```

### Fluxo de Autenticação

```mermaid
sequenceDiagram
    participant U as Usuário
    participant FE as Frontend (Angular)
    participant API as Backend (FastAPI)
    participant DB as PostgreSQL

    U->>FE: Preenche email e senha
    FE->>API: POST /api/v1/auth/access-token
    API->>DB: Busca usuário por email
    DB-->>API: Dados do usuário
    API->>API: Verifica senha (bcrypt)
    alt Credenciais válidas
        API-->>FE: JWT Token (120 min, HS256)
        FE->>FE: Armazena token no localStorage
        FE->>API: GET /api/v1/users/me (Header: Bearer token)
        API-->>FE: Dados do usuário + professional (se aplicável)
        FE->>FE: Redireciona por tipo (client → search / professional → dashboard)
    else Credenciais inválidas
        API-->>FE: 400 Bad Request
        FE->>U: Exibe mensagem de erro
    end
```

---

## 📂 Estrutura do Projeto

```
/
├── backend/                          # API FastAPI (Python 3.11)
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── api.py                # Router aggregator
│   │   │   └── endpoints/            # 12 routers
│   │   │       ├── auth.py           # Login JWT
│   │   │       ├── users.py          # CRUD usuários
│   │   │       ├── professionals.py  # Perfil profissional
│   │   │       ├── services.py       # CRUD serviços
│   │   │       ├── appointments.py   # Agendamentos (autenticado)
│   │   │       ├── guest_appointments.py  # Agendamento Guest
│   │   │       ├── working_hours.py  # Expediente (batch save)
│   │   │       ├── blocks.py         # Bloqueios de agenda
│   │   │       ├── upload.py         # Upload Cloudinary
│   │   │       ├── logs.py           # Receber logs do frontend
│   │   │       ├── clients.py        # Placeholder
│   │   │       └── reviews.py        # Placeholder
│   │   ├── core/
│   │   │   ├── config.py             # Settings (Pydantic BaseSettings)
│   │   │   ├── database.py           # SQLAlchemy engine + SessionLocal
│   │   │   ├── security.py           # JWT create/decode + password hash
│   │   │   ├── email.py              # Resend email service
│   │   │   ├── cloudinary_service.py # Cloudinary upload
│   │   │   ├── enums/                # Enums compartilhados
│   │   │   └── logging/              # Sistema de logs MongoDB
│   │   │       ├── log_middleware.py  # Middleware HTTP (trace_id)
│   │   │       ├── log_repository.py # Motor async → MongoDB
│   │   │       ├── log_schema.py     # Schemas dos logs
│   │   │       ├── log_service.py    # Interface do serviço
│   │   │       └── log_dependency.py # FastAPI dependency
│   │   ├── models/                   # 7 modelos SQLAlchemy
│   │   ├── schemas/                  # Pydantic schemas (request/response)
│   │   ├── crud/                     # CRUD genérico
│   │   ├── services/                 # Business logic (email)
│   │   ├── templates/                # Template HTML do email (Jinja2)
│   │   ├── initial_data.py           # Seed do banco de dados
│   │   └── main.py                   # Entry point (lifespan, CORS, handlers)
│   ├── alembic/                      # Migrations
│   ├── tests/                        # Pytest (auth, users, notifications)
│   ├── Dockerfile                    # Produção (multistage)
│   ├── Dockerfile.dev                # Desenvolvimento (hot reload)
│   ├── Procfile                      # Gunicorn — Railway
│   └── requirements.txt              # Dependências Python
│
├── frontend/                         # SPA Angular 21
│   ├── src/app/
│   │   ├── core/
│   │   │   ├── guards/               # AuthGuard, RoleGuard
│   │   │   ├── interceptors/         # Auth interceptor (Bearer header)
│   │   │   ├── services/             # API service, Auth service
│   │   │   └── models/               # Interfaces TypeScript
│   │   ├── features/
│   │   │   ├── client/               # Módulo do cliente
│   │   │   │   ├── search/           # Busca de profissionais
│   │   │   │   ├── booking/          # Calendário + agendamento
│   │   │   │   ├── appointments/     # Lista de agendamentos
│   │   │   │   └── settings/         # Configurações do cliente
│   │   │   ├── professional/         # Módulo do profissional
│   │   │   │   ├── dashboard/        # Dashboard + lista de agendamentos
│   │   │   │   ├── services-manager/ # CRUD de serviços
│   │   │   │   ├── block-manager/    # Gerenciar bloqueios (calendário)
│   │   │   │   └── settings/         # Expediente + perfil + foto
│   │   │   └── common/
│   │   │       └── register/         # Tela de cadastro
│   │   └── login/                    # Tela de login
│   ├── src/environments/             # environment.ts + production
│   ├── Dockerfile / Dockerfile.dev   # Build de produção (nginx) / dev
│   ├── nginx.conf                    # Proxy reverso para SPA
│   ├── playwright.config.ts          # E2E tests config
│   ├── vitest.config.ts              # Unit tests config
│   └── package.json                  # Dependências (angular, material, rxjs)
│
├── docker/
│   └── mongo/init-log-db.js          # Script de init do MongoDB (cria user + collection)
│
├── postman/
│   ├── collections/                  # Coleção Postman exportada
│   └── globals/                      # Variáveis globais
│
├── docker-compose.yml                # Ambiente de desenvolvimento (4 containers)
├── docker-compose.prod.yml           # Versão de produção
├── vercel.json                       # Deploy frontend (rewrites, security headers)
├── .env.example                      # Modelo de variáveis de ambiente
└── .gitignore
```

---

## 🔌 Endpoints da API

Todos prefixados com `/api/v1`. Documentação interativa completa em `/docs` (Swagger UI).

### Auth

| Método | Rota                 | Descrição                          | Auth |
| ------ | -------------------- | ---------------------------------- | ---- |
| POST   | `/auth/access-token` | Login — retorna JWT `access_token` | ❌   |

### Users

| Método | Rota          | Descrição                                     | Auth |
| ------ | ------------- | --------------------------------------------- | ---- |
| GET    | `/users/`     | Listar usuários                               | ✅   |
| POST   | `/users/`     | Criar novo usuário (registro)                 | ❌   |
| GET    | `/users/me`   | Dados do usuário logado (inclui professional) | ✅   |
| PUT    | `/users/{id}` | Atualizar dados do usuário                    | ✅   |

### Professionals

| Método | Rota                  | Descrição                                | Auth  |
| ------ | --------------------- | ---------------------------------------- | ----- |
| GET    | `/professionals/`     | Listar profissionais (filtro `?search=`) | ❌    |
| GET    | `/professionals/{id}` | Detalhes de um profissional              | ❌    |
| PUT    | `/professionals/{id}` | Atualizar perfil profissional            | ✅ 🔒 |

### Services

| Método | Rota             | Descrição                             | Auth  |
| ------ | ---------------- | ------------------------------------- | ----- |
| GET    | `/services/`     | Listar serviços (`?professional_id=`) | ❌    |
| POST   | `/services/`     | Criar serviço                         | ✅ 🔒 |
| PUT    | `/services/{id}` | Atualizar serviço                     | ✅ 🔒 |
| DELETE | `/services/{id}` | Remover serviço                       | ✅ 🔒 |

### Appointments

| Método | Rota                        | Descrição                                    | Auth  |
| ------ | --------------------------- | -------------------------------------------- | ----- |
| POST   | `/appointments/`            | Criar agendamento (usuário logado)           | ✅    |
| GET    | `/appointments/`            | Listar agendamentos do usuário               | ✅    |
| PATCH  | `/appointments/{id}/status` | Alterar status (confirmar/cancelar/concluir) | ✅ 🔒 |

### Guest Appointments

| Método | Rota                   | Descrição                         | Auth |
| ------ | ---------------------- | --------------------------------- | ---- |
| POST   | `/guest-appointments/` | Agendamento sem login (visitante) | ❌   |

### Working Hours

| Método | Rota                   | Descrição                                    | Auth  |
| ------ | ---------------------- | -------------------------------------------- | ----- |
| GET    | `/working-hours/`      | Horários de expediente (`?professional_id=`) | ❌    |
| POST   | `/working-hours/batch` | Salvar horários em lote (batch upsert)       | ✅ 🔒 |

### Blocks

| Método | Rota           | Descrição                              | Auth  |
| ------ | -------------- | -------------------------------------- | ----- |
| GET    | `/blocks/`     | Listar bloqueios (`?professional_id=`) | ❌    |
| POST   | `/blocks/`     | Criar bloqueio de período              | ✅ 🔒 |
| DELETE | `/blocks/{id}` | Remover bloqueio                       | ✅ 🔒 |

### Upload

| Método | Rota            | Descrição                             | Auth  |
| ------ | --------------- | ------------------------------------- | ----- |
| POST   | `/upload/photo` | Upload de foto de perfil (Cloudinary) | ✅ 🔒 |

### Logs & Health

| Método | Rota             | Descrição                | Auth |
| ------ | ---------------- | ------------------------ | ---- |
| POST   | `/logs/frontend` | Receber logs do frontend | ❌   |
| GET    | `/health`        | Health check do serviço  | ❌   |

> **Legenda:** ✅ = Requer JWT Bearer token | 🔒 = Requer role `professional`

---

## ⚙️ Variáveis de Ambiente

| Variável                | Descrição                              | Obrigatória |         Valor Padrão         |
| ----------------------- | -------------------------------------- | :---------: | :--------------------------: |
| `DATABASE_URL`          | Connection string PostgreSQL           |     ✅      |              —               |
| `SECRET_KEY`            | Chave secreta para JWT (min 32 chars)  |     ✅      |              —               |
| `POSTGRES_USER`         | Usuário do PostgreSQL                  |   Docker    |          `postgres`          |
| `POSTGRES_PASSWORD`     | Senha do PostgreSQL                    |   Docker    |          `postgres`          |
| `POSTGRES_DB`           | Nome do banco de dados                 |   Docker    |            `app`             |
| `MONGO_ROOT_USER`       | Usuário root do MongoDB                |   Docker    |              —               |
| `MONGO_ROOT_PASSWORD`   | Senha root do MongoDB                  |   Docker    |              —               |
| `LOG_MONGO_USER`        | Usuário do MongoDB para logs           |     ✅      |              —               |
| `LOG_MONGO_PASSWORD`    | Senha do MongoDB para logs             |     ✅      |              —               |
| `LOG_MONGO_URI`         | URI de conexão MongoDB                 |     ✅      |              —               |
| `LOG_DB_NAME`           | Nome do banco de logs                  |     ✅      |          `app_logs`          |
| `LOG_LEVEL`             | Nível de log (`debug`, `info`, `warn`) |     ❌      |            `info`            |
| `RESEND_API_KEY`        | API Key do Resend                      |     ❌      |              —               |
| `EMAILS_FROM_ADDRESS`   | Email remetente                        |     ❌      | `contato@fgsoftware.digital` |
| `EMAILS_ENABLED`        | Habilitar envio de emails              |     ❌      |           `false`            |
| `CLOUDINARY_CLOUD_NAME` | Cloud Name do Cloudinary               |     ❌      |              —               |
| `CLOUDINARY_API_KEY`    | API Key do Cloudinary                  |     ❌      |              —               |
| `CLOUDINARY_API_SECRET` | API Secret do Cloudinary               |     ❌      |              —               |
| `BACKEND_CORS_ORIGINS`  | Lista JSON de origens permitidas       |     ❌      | `["http://localhost:4200"]`  |
| `ENVIRONMENT`           | `development` ou `production`          |     ❌      |        `development`         |
| `FRONTEND_URL`          | URL do frontend (para links em emails) |     ❌      |   `http://localhost:4200`    |

---

## 🧪 Testes Automatizados

### Backend (Pytest)

```bash
# Rodar todos os testes
docker compose exec backend python -m pytest tests/ -v

# Rodar com cobertura (se coverage instalado)
docker compose exec backend python -m pytest tests/ -v --tb=short
```

**Testes existentes:**

| Arquivo                 | Cobertura                                 |
| ----------------------- | ----------------------------------------- |
| `test_auth.py`          | Login com credenciais válidas e inválidas |
| `test_users.py`         | Criação de usuários, validação de dados   |
| `test_notifications.py` | Serviço de envio de emails                |

### Frontend (Vitest + Playwright)

```bash
# Unit tests (Vitest)
cd frontend && npm test

# Para rodar E2E com Playwright (requer playwright instalado)
cd frontend && npx playwright test
```

### Testando via Swagger

1. Acesse `http://localhost:8000/docs`
2. Clique em **POST /api/v1/auth/access-token**
3. Clique em **Try it out**
4. Preencha `username` e `password` com as credenciais de teste
5. Copie o `access_token` da resposta
6. Clique em **Authorize** (ícone do cadeado no topo)
7. Cole o token e clique **Authorize**
8. Agora todos os endpoints protegidos podem ser testados

---

## 🚀 Deploy em Produção

### Infraestrutura Cloud

| Serviço              | Plataforma    | Tier             | Observação                    |
| -------------------- | ------------- | ---------------- | ----------------------------- |
| Frontend             | Vercel        | Free             | CDN global + Security Headers |
| Backend + PostgreSQL | Railway       | Free / Hobby     | PaaS com banco integrado      |
| MongoDB (Logs)       | MongoDB Atlas | Free (M0, 512MB) | Cluster compartilhado         |

### Passos de Deploy

1. **MongoDB Atlas** — Criar cluster M0 gratuito → criar usuário → copiar connection string
2. **Railway** — Importar repo GitHub (`Root Directory: backend`) → adicionar PostgreSQL → configurar variáveis de ambiente
3. **Frontend** — Editar `frontend/src/environments/environment.production.ts` com URL do Railway → importar no Vercel (`Root Directory: frontend`)
4. **CORS** — No Railway, setar `BACKEND_CORS_ORIGINS=["https://seu-app.vercel.app"]`

### URLs de Produção (se deploy ativo)

| Serviço     | URL                                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------------------ |
| Frontend    | [https://fgsoftware.digital](https://fgsoftware.digital)                                               |
| Backend API | [https://astrocode-teste-production.up.railway.app](https://astrocode-teste-production.up.railway.app) |

---

## 🗃️ Coleção Postman

Uma coleção Postman pré-configurada está incluída no repositório para facilitar testes da API.

```bash
# Localização dos arquivos
postman/
├── collections/
│   └── Astrocode Teste API.postman_collection.json
└── globals/
    └── [variáveis globais]
```

**Como usar:**

1. Abra o Postman
2. Clique em **Import** → arraste o arquivo JSON da coleção
3. A variável `{{base_url}}` está pré-configurada para `http://localhost:8000`
4. Para produção, altere para `https://astrocode-teste-production.up.railway.app`
5. Execute o request de login primeiro para obter o token

---

## 🐳 Comandos Úteis

```bash
# ── Ciclo de vida ──
docker compose up --build              # Subir com rebuild
docker compose up -d                   # Subir em background
docker compose down                    # Parar containers
docker compose down -v                 # Parar + remover volumes (reset DB)
docker compose restart backend         # Reiniciar apenas o backend

# ── Banco de dados ──
docker compose exec backend alembic upgrade head         # Rodar migrations
docker compose exec backend python -m app.initial_data   # Popular banco (seed)
docker compose exec backend alembic revision --autogenerate -m "description"  # Nova migration

# ── Debugging ──
docker compose logs -f backend         # Logs do backend em tempo real
docker compose logs -f frontend        # Logs do frontend em tempo real
docker compose logs -f                 # Logs de todos os serviços

# ── Rebuild completo (quando algo parece estranho) ──
docker compose down -v && docker compose up --build --force-recreate

# ── Acessar shell dos containers ──
docker compose exec backend bash       # Shell do backend
docker compose exec frontend sh        # Shell do frontend (Alpine)
docker compose exec db psql -U postgres -d astrocode  # Console PostgreSQL
```

---

## 📐 Decisões Técnicas

### Por que PostgreSQL + MongoDB?

| Aspecto           | PostgreSQL                                                     | MongoDB                                                |
| ----------------- | -------------------------------------------------------------- | ------------------------------------------------------ |
| **Uso**           | Dados de negócio (usuários, agendamentos, serviços)            | Logs e auditoria                                       |
| **Justificativa** | Dados estruturados com relações, integridade referencial, ACID | Schema flexível para logs de alta escrita, TTL indexes |
| **Trade-off**     | Mais overhead de schema                                        | Sem transações ACID multi-documento                    |

### Por que UUID v7 para User IDs?

- **Time-ordered:** UUIDs v7 são ordenados cronologicamente, melhorando performance de indexes B-tree
- **Uniqueness:** Globalmente únicos sem coordenação centralizada
- **Compatibilidade:** Funciona nativamente com PostgreSQL UUID type

### Por que Tabelas Normalizadas?

- **Consistência:** Alteração de preço de serviço propaga sem duplicação
- **Queries flexíveis:** JOINs entre profissional → serviços → agendamentos
- **Escala:** Para o volume esperado (< 100k registros), o overhead de JOINs é negligível

### Por que DECIMAL para Preços?

- **Precisão:** `float` causa erros de arredondamento em cálculos monetários
- **Padrão:** DECIMAL é o tipo recomendado para valores financeiros em todos os SGBDs

### Por que Alembic para Migrations?

- **Versionamento:** Cada mudança de schema é rastreável e reversível
- **Autogenerate:** Detecta diferenças entre modelos SQLAlchemy e o schema atual
- **Team-friendly:** Migrations são arquivos Python commitados no repositório

### Por que Motor (async) para MongoDB?

- **Non-blocking:** Operações de log não bloqueiam o event loop do FastAPI
- **Performance:** Escritas assíncronas permitem responder ao cliente imediatamente
- **Middleware:** O LogMiddleware registra trace_id, duração e erros de cada request

---

## 📜 Licença

MIT

---

> **Desenvolvido por [Felipe Gomes](https://github.com/felipe-gomes0)** como projeto de avaliação técnica.
