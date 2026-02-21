#!/bin/bash
# start.sh - Script de inicialização do Docker

echo "Iniciando verificação do banco de dados..."

# Roda o script de população do banco de dados (que é seguro/idempotente e ignora se os usuários já existirem)
echo "Populando profissionais padrão..."
python populate_db.py

echo "Iniciando aplicação FastAPI..."
# O comando exec garante que o Uvicorn receba os sinais de parada (SIGTERM) do Docker/Railway corretamente
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --proxy-headers --forwarded-allow-ips="*"
