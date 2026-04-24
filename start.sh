#!/bin/bash

set -u

# Pega o diretório onde o script está localizado
BASE_DIR="$(cd "$(dirname "$0")" && pwd)"

LOG_DIR="$BASE_DIR/logs/$(date +%Y-%m-%d)"
mkdir -p "$LOG_DIR"

MAINTENANCE_LOG="$LOG_DIR/maintenance.log"
SITE_LOG="$LOG_DIR/site.log"
DATABASE_LOG="$LOG_DIR/database.log"
GIT_LOG="$LOG_DIR/git.log"

log() {
    echo "[$(date '+%H:%M:%S')] $1"
}

log "🛑 Parando servidores..."
pkill -f main.py 2>/dev/null || true
sleep 2

# ------------------ MANUTENÇÃO ------------------
if [ -d "index/maintenance" ]; then
    log "🚧 Iniciando modo manutenção..."
    (nohup python3 "index/maintenance/main.py" >> "$MAINTENANCE_LOG" 2>&1 &)
    sleep 2
    log "✅ Manutenção ativa na porta 5000"
else
    log "❌ Erro: pasta maintenance não encontrada em $BASE_DIR/maintenance"
fi

# ------------------ LIMPA ------------------
log "🧹 Limpando site..."
rm -rf "index/site"

# ------------------ DOWNLOAD ------------------
log "📥 Baixando atualização..."

mkdir -p "index/site"
cd "index/site" || exit 1

git init -q
git remote add origin https://github.com/kendrick3004/index.git
git config core.sparseCheckout true
echo "site/*" > .git/info/sparse-checkout

if git pull --depth=1 origin main >> "$GIT_LOG" 2>&1; then
    log "✅ Download concluído"
else
    log "❌ Erro no download (ver log)"
    exit 1
fi

mv site/* .
rm -rf site .git

# ------------------ DATABASE ------------------
if [ -d "index/site/database/assets" ]; then
    log "🔎 Gerando database..."

    cd "index/site/database" || exit 1

    if python3 generate_assets_structure.py >> "$DATABASE_LOG" 2>&1; then
        log "✅ Database gerado"
    else
        log "❌ Erro no database"
    fi
else
    log "❌ assets não encontrada"
fi

# ------------------ FINALIZA ------------------
log "🛑 Encerrando manutenção..."
pkill -f main.py 2>/dev/null || true
sleep 2

log "🚀 Subindo site..."
(cd "index/site" && nohup python3 main.py >> "$SITE_LOG" 2>&1 &)

log "✅ Deploy finalizado"
log "📊 Logs: $LOG_DIR"
