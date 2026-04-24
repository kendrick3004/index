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
log "🧹 Limpando site..."
rm -rf "index/site"

# ------------------ DOWNLOAD ------------------
log "📥 Baixando atualização..."
log "🔗 Clonando repositório com Sparse Checkout..."

mkdir -p "index/site"
cd "index/site" || exit 1

log "⏳ Puxando dados do repositório..."
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Clone com sparse checkout e mostra progresso natural
if git clone --sparse --depth=1 https://github.com/kendrick3004/index.git . 2>&1 | tee -a "$GIT_LOG"; then
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    log "📂 Configurando sparse checkout (apenas /site)..."
    git sparse-checkout set site 2>&1 | tee -a "$GIT_LOG"
    log "✓ Sparse Checkout configurado"
    
    log "✅ Download concluído com sucesso"
else
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log "❌ Erro no download (ver log em: $GIT_LOG)"
    exit 1
fi

# ------------------ DATABASE ------------------
log "🗄️ Verificando estrutura do database..."
if [ -d "index/site/database/assets" ]; then
    log "🔎 Gerando database..."
    log "⏳ Processando estrutura de assets (PROGRESS)..."

    cd "index/site/database" || exit 1

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
pkill -f "index/maintenance/main.py" 2>/dev/null || true
sleep 2
log "✓ Servidor de manutenção parado"

log "🚀 Iniciando servidor do site..."
log "⏳ Aguardando inicialização (porta 5000)..."
(cd "index/site" && nohup python3 main.py >> "$SITE_LOG" 2>&1 &)
sleep 3
log "✓ Servidor do site iniciado"

log "✅ Deploy finalizado com sucesso!"
log "📊 Logs salvos em: $LOG_DIR"
log "🌐 Site disponível em: http://localhost:5000"
