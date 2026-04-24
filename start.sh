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
if [ -d "$BASE_DIR/maintenance" ]; then
    log "🚧 Iniciando modo manutenção..."
    (nohup python3 "$BASE_DIR/maintenance/main.py" >> "$MAINTENANCE_LOG" 2>&1 &)
    sleep 2
    log "✅ Manutenção ativa na porta 5000"
else
    log "❌ Erro: pasta maintenance não encontrada em $BASE_DIR/maintenance"
fi

# ------------------ LIMPA ------------------
log "🧹 Limpando site antigo..."
rm -rf "$BASE_DIR/site"

# ------------------ DOWNLOAD ------------------
log "📥 Baixando atualização..."
log "🔗 Clonando repositório com Sparse Checkout..."

mkdir -p "$BASE_DIR/site"
cd "$BASE_DIR/site" || exit 1

log "⏳ Puxando dados do repositório..."
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Configurações de timeout e retry para git
export GIT_CONNECT_TIMEOUT=120
export GIT_HTTP_CONNECT_TIMEOUT=120

RETRY_COUNT=0
MAX_RETRIES=3
CLONE_SUCCESS=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ] && [ "$CLONE_SUCCESS" = false ]; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -gt 1 ]; then
        log "🔄 Tentativa $RETRY_COUNT de $MAX_RETRIES..."
        sleep 5
    fi
    
    # Clone com sparse checkout otimizado
    if timeout 300 git clone --depth=1 --single-branch --branch main https://github.com/kendrick3004/index.git . 2>&1 | tee -a "$GIT_LOG"; then
        CLONE_SUCCESS=true
    fi
done

if [ "$CLONE_SUCCESS" = true ]; then
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    log "📂 Configurando sparse checkout (apenas /site)..."
    if git sparse-checkout init --cone 2>&1 | tee -a "$GIT_LOG"; then
        git sparse-checkout set site 2>&1 | tee -a "$GIT_LOG"
        log "✓ Sparse Checkout configurado"
    else
        log "⚠️  Sparse checkout não disponível, usando clone completo"
    fi
    
    log "✅ Download concluído com sucesso"
else
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log "❌ Erro no download após $MAX_RETRIES tentativas (ver log em: $GIT_LOG)"
    exit 1
fi

# ------------------ DATABASE ------------------
log "🗄️ Verificando estrutura do database..."
if [ -d "$BASE_DIR/site/database/assets" ]; then
    log "🔎 Gerando database..."
    log "⏳ Processando estrutura de assets (PROGRESS)..."

    cd "$BASE_DIR/site/database" || exit 1

    if python3 generate_assets_structure.py 2>&1 | tee -a "$DATABASE_LOG"; then
        log "✅ Database gerado com sucesso"
    else
        log "❌ Erro na geração do database (ver log em: $DATABASE_LOG)"
    fi
else
    log "❌ Pasta assets não encontrada em index/site/database/assets"
fi

# ------------------ FINALIZA ------------------
log "🛑 Encerrando servidor de manutenção..."
pkill -f "maintenance/main.py" 2>/dev/null || true
sleep 2
log "✓ Servidor de manutenção parado"

log "🚀 Iniciando servidor do site..."
log "⏳ Aguardando inicialização (porta 5000)..."
(cd "$BASE_DIR/site" && nohup python3 main.py >> "$SITE_LOG" 2>&1 &)
sleep 3
log "✓ Servidor do site iniciado"

log "✅ Deploy finalizado com sucesso!"
log "📊 Logs salvos em: $LOG_DIR"
log "🌐 Site disponível em: http://localhost:5000"
