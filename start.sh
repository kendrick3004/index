#!/bin/bash

set -u

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

export LC_ALL=C
export GIT_PROGRESS_DELAY=0

log "🛑 Parando servidores..."
pkill -f main.py 2>/dev/null || true
sleep 2

# ------------------ MANUTENÇÃO ------------------
if [ -d "$BASE_DIR/maintenance" ]; then
    log "🚧 Iniciando modo manutenção..."
    (nohup python3 "$BASE_DIR/maintenance/main.py" >> "$MAINTENANCE_LOG" 2>&1 &)
    sleep 2
    log "✅ Manutenção ativa na porta 5000"
else
    log "❌ Erro: pasta maintenance não encontrada"
fi

# ------------------ LIMPA ------------------
log "🧹 Limpando site antigo..."
rm -rf "$BASE_DIR/site"

# ------------------ DOWNLOAD ------------------
log "📥 Baixando atualização..."
mkdir -p "$BASE_DIR/site"
cd "$BASE_DIR/site" || exit 1

export GIT_CONNECT_TIMEOUT=120
export GIT_HTTP_CONNECT_TIMEOUT=120

RETRY_COUNT=0
MAX_RETRIES=3
CLONE_SUCCESS=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ] && [ "$CLONE_SUCCESS" = false ]; do
    RETRY_COUNT=$((RETRY_COUNT + 1))

    if [ $RETRY_COUNT -gt 1 ]; then
        log "🔄 Tentativa $RETRY_COUNT..."
        sleep 5
        rm -rf .git
    fi

    log "📊 Iniciando clonagem..."

    buffer=""

    if timeout 600 git clone --depth=1 --single-branch --branch main --progress https://github.com/kendrick3004/index.git . 2>&1 | tee -a "$GIT_LOG" | \
    while IFS= read -r -n 1 char; do

        buffer+="$char"

        if [[ "$char" == $'\r' ]]; then
            line="$buffer"
            buffer=""

            if [[ "$line" == *"Receiving objects:"* ]]; then
                percent=$(echo "$line" | grep -oE '[0-9]+%' | tr -d '%')

                if [[ -n "$percent" ]]; then
                    filled=$((percent / 2))
                    empty=$((50 - filled))

                    bar=$(printf "%${filled}s" | tr ' ' '█')
                    bar+=$(printf "%${empty}s" | tr ' ' '░')

                    printf "\r📥 Baixando: [%-50s] %3d%%" "$bar" "$percent"
                fi
            fi
        fi

    done; then

        echo ""
        log "✓ Clone concluído"

        if [ -f "site/index.html" ]; then
            log "✓ Arquivos OK"
            CLONE_SUCCESS=true
        else
            log "⚠️ Estrutura inesperada, retry..."
        fi
    else
        log "⚠️ Falha no clone"
    fi
done

if [ "$CLONE_SUCCESS" != true ]; then
    log "❌ Falha após $MAX_RETRIES tentativas"
    exit 1
fi

# ------------------ DATABASE ------------------
log "🗄️ Verificando database..."
if [ -d "$BASE_DIR/site/database/assets" ]; then
    cd "$BASE_DIR/site/database" || exit 1

    if python3 generate_assets_structure.py 2>&1 | tee -a "$DATABASE_LOG"; then
        log "✅ Database OK"
    else
        log "❌ Erro database"
    fi
else
    log "❌ Assets não encontrado"
fi

# ------------------ FINALIZA ------------------
log "🛑 Encerrando manutenção..."
pkill -f "maintenance/main.py" 2>/dev/null || true
sleep 2

log "🚀 Iniciando site..."
(cd "$BASE_DIR/site" && nohup python3 main.py >> "$SITE_LOG" 2>&1 &)
sleep 3

log "✅ Deploy finalizado"
log "📊 Logs: $LOG_DIR"
log "🌐 http://localhost:5000"