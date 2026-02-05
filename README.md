# Sistema de Agendamento de Serviços

Uma aplicação voltada para agendamentos de horários para serviços, desenvolvida para ser um projeto desafiador e interessante. O sistema é voltado para profissionais que precisam disponibilizar sua agenda para que clientes possam acessar e marcar horários de forma simples e eficiente.

## 🚀 Tecnologias Utilizadas

O projeto foi construído utilizando uma stack moderna e containerizada:

- **Frontend**: Angular (v19+) - Interface do usuário responsiva e dinâmica.
- **Backend**: FastAPI (Python) - API RESTful de alta performance.
- **Banco de Dados**: PostgreSQL - Persistência robusta de dados.
- **Infraestrutura**: Docker & Docker Compose - Ambiente de desenvolvimento isolado e reproduzível.

## 📂 Estrutura do Projeto

```
/
├── backend/            # Código fonte da API (FastAPI)
├── frontend/           # Código fonte da interface (Angular)
├── docker-compose.yml  # Orquestração dos containers
├── .env.example        # Modelo das variáveis de ambiente
└── README.md           # Documentação do projeto
```

## 🛠️ Como Executar

### Pré-requisitos

Certifique-se de ter instalado em sua máquina:

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

### Passo a Passo

1.  **Clone o repositório:**

    ```bash
    git clone https://github.com/felipe-gomes0/astrocode-teste.git
    cd astrocode-teste
    ```

2.  **Configure as variáveis de ambiente:**
    Copie o arquivo de exemplo para criar o seu arquivo `.env`:

    ```bash
    cp .env.example .env
    ```

    _Opcional: Edite o arquivo `.env` se desejar alterar as configurações padrão (usuário e senha do banco)._

3.  **Inicie a aplicação:**
    Execute o comando abaixo para construir e iniciar os containers:

    ```bash
    docker-compose up --build
    ```

4.  **Acesse a aplicação:**
    - **Frontend (Aplicação Web)**: [http://localhost](http://localhost)
    - **Backend (Documentação da API / Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)

## 🐳 Comandos Úteis

- **Parar a aplicação:** `Ctrl+C` (se rodando no terminal) ou `docker compose down`.
- **Recriar containers:** `docker compose up --build --force-recreate`.
- **Logs do backend:** `docker compose logs -f backend`.
