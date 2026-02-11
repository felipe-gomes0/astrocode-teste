# PR: Implementação de CRUD de Usuários e Autenticação

## 📝 Resumo

Este Pull Request implementa o sistema completo de gerenciamento de usuários, incluindo operações CRUD e autenticação baseada em JWT. Também refatora os modelos de banco de dados para usar UUIDv7 como chave primária e atualiza a documentação/coleção da API.

## ✨ Principais Alterações

### 🔐 Autenticação

- Implementado endpoint `/auth/access-token` para login.
- Adicionada geração e validação de token JWT.
- Rotas protegidas usando dependência `Sub` para recuperação do usuário atual.
- Implementado hashing de senha usando `passlib`.

### 👤 Gerenciamento de Usuários (CRUD)

- **Criar**: Endpoint para registrar novos usuários com validação.
- **Ler**:
  - `GET /users/`: Listar todos os usuários (com paginação).
  - `GET /users/{id}`: Obter detalhes de um usuário específico.
  - `GET /users/me`: Obter perfil do usuário autenticado atual.
- **Atualizar**: `PUT /users/{id}` para modificar detalhes do usuário.
- **Deletar**: `DELETE /users/{id}` para remover usuários (restrito).

### 🛠️ Infraestrutura e Refatoração

- **Migração para UUIDv7**: Atualizado o modelo `User` para usar UUIDv7 para unicidade ordenada por tempo.
- **Modelos de Banco de Dados**: Atualizados modelos SQLAlchemy para Usuários.
- **Schemas**: Adicionados schemas Pydantic para `UserCreate`, `UserUpdate` e `Token`.

### 🧪 Testes e Documentação

- **Postman**: Atualizado `postman_collection.json` com:
  - Requisição Auth/Login (define automaticamente a variável `token`).
  - Requisições CRUD de usuário.
  - Endpoint "Obter Usuário Atual".
- **Testes**: Adicionados/Atualizados testes para endpoints de usuário.

## ✅ Plano de Verificação

1. **Testes Automatizados**:
   ```bash
   docker compose exec backend python -m pytest
   ```
2. **Verificação Manual (Postman)**:
   - Importar `backend/postman_collection.json`.
   - Executar **Auth -> Login** para obter um token.
   - Executar **Users -> Get Current User** para verificar autenticação.
   - Testar fluxos de Criar/Atualizar/Deletar.

## 🔗 Issues Relacionadas

- Closes # (se aplicável)
