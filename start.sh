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

log "🛑 Parando servidores de sites..."
pkill -f main.py 2>/dev/null || true
sleep 2

# ------------------ MANUTENÇÃO ------------------
# Comentado para agilizar o teste direto do site
# if [ -d "$BASE_DIR/maintenance" ]; then
#     log "🚧 Iniciando modo manutenção..."
#     (nohup python3 "$BASE_DIR/maintenance/main.py" >> "$MAINTENANCE_LOG" 2>&1 &)
#     sleep 2
#     log "✅ Manutenção ativa na porta 5000"
# fi

# ------------------ LIMPA & DOWNLOAD (PULADO) ------------------
log "⏭️  Pulando download do Git para preservar alterações locais..."

# ------------------ DATABASE ------------------
log "🗄️ Verificando estrutura do database..."
if [ -d "$BASE_DIR/site" ]; then
    log "🔎 Verificando funcionalidades de database..."
    cd "$BASE_DIR/site" || exit 1

    if [ -f "generate_assets_structure.py" ]; then
        if python3 generate_assets_structure.py 2>&1 | tee -a "$DATABASE_LOG"; then
            log "✅ Database configurado e estruturado com sucesso"
        else
            log "❌ Erro na geração do database (ver log em: $DATABASE_LOG)"
        fi
    else
        log "⚠️ Script generate_assets_structure.py não encontrado"
    fi
else
    log "❌ Pasta site não encontrada em $BASE_DIR/site"
fi

# ------------------ FINALIZA ------------------
log "🛑 Garantindo que o servidor de manutenção está parado..."
pkill -f "maintenance/main.py" 2>/dev/null || true
sleep 1

log "🚀 Iniciando servidor do site..."
log "⏳ Aguardando inicialização (porta 5000)..."
cd "$BASE_DIR/site" && nohup python3 main.py >> "$SITE_LOG" 2>&1 &
sleep 3

# Verifica se o processo está rodando
if pgrep -f "python3 main.py" > /dev/null; then
    log "✓ Servidor do site iniciado com sucesso"
else
    log "❌ Falha ao iniciar o servidor do site. Verifique $SITE_LOG"
fi

log "✅ Deploy finalizado com sucesso!"
log "📊 Logs salvos em: $LOG_DIR"
log "🌐 Site disponível localmente na porta 5000"
