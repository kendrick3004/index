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
if [ -d "$BASE_DIR/maintenance" ]; then
    log "🚧 Iniciando modo manutenção..."
    (nohup python3 "$BASE_DIR/maintenance/main.py" >> "$MAINTENANCE_LOG" 2>&1 &)
    sleep 2
    log "✅ Manutenção ativa na porta 5000"
else
    log "❌ Erro: pasta maintenance não encontrada em $BASE_DIR/maintenance"
fi

# ------------------ LIMPA ------------------
log "🧹 Limpando arquivos de index/site antigo..."
rm -rf "$BASE_DIR/index/site"

# ------------------ DOWNLOAD ------------------
log "📥 Acessando repositórios para atualização..."

mkdir -p "$BASE_DIR/index/site"
cd "$BASE_DIR/index/site" || exit 1

log "⏳ Extraindo dados do repositório com Sparse Checkout..."
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
        rm -rf .git
    fi
    
    log "📊 Iniciando clonagem..."
    
    # 🎯 BARRINHA + % + VELOCIDADE - SÓ UMA LINHA LIMPA!
   timeout 600 git clone --depth=1 --single-branch --branch main --progress https://github.com/kendrick3004/index.git . >> "$GIT_LOG" 2>&1 &
    GIT_PID=$!
    
    while kill -0 $GIT_PID 2>/dev/null; do
        percent=$(tail -20 "$GIT_LOG" | grep -o "[0-9]\+%" | tail -1 | tr -d "%" || echo "0")
        speed=$(tail -5 "$GIT_LOG" | grep -o "[0-9]\+\.[0-9]\+ [KMG]iB/s" | tail -1 || echo "")
        filled=$((percent * 50 / 100))
        bar=""; for ((i=0;i<filled;i++)); do bar+="█"; done; for ((i=filled;i<50;i++)); do bar+="░"; done
        printf "\r📥 Baixando: [%-50s] %3d%% - %s" "$bar" "$percent" "$speed"
        sleep 0.5
    done
   
    wait $GIT_PID
    echo ""
    
    if [ ${PIPESTATUS[0]} -eq 0 ]; then
        log "✓ Clone concluído, checando integridade..."
        if [ -f "index.html" ] || [ -f "site/index.html" ]; then
            log "✓ Arquivos do site intactos, clonagem bem-sucedida"
            CLONE_SUCCESS=true
        else
            log "⚠️  Site não encontrado, tentando novamente..."
        fi
    else
        log "⚠️  Git clone falhou ou timeout"
    fi
done

if [ "$CLONE_SUCCESS" = true ]; then
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    log "📂 Configurando sparse checkout (site)..."
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

# ------------------ DATABASE ✅ CORRIGIDO ------------------
log "🗄️ Verificando estrutura do database..."
if [ -d "BASE_DIR/index/site/site/database" ]; then
    log "🔎 Verificando funcionalidades de database..."
    cd "$BASE_DIR/index/site/database" || exit 1

    if python3 generate_assets_structure.py 2>&1 | tee -a "$DATABASE_LOG"; then
        log "✅ Database configurado e estruturado com sucesso"
    else
        log "❌ Erro na geração do database (ver log em: $DATABASE_LOG)"
    fi
else
    log "❌ Pasta assets não encontrada em $BASE_DIR/index/site/database/assets"
fi

# ------------------ FINALIZA ------------------
log "🛑 Encerrando servidor de manutenção..."
pkill -f "maintenance/main.py" 2>/dev/null || true
sleep 2
log "Preparando para alternação de servidor..."

log "🚀 Iniciando servidor do site..."
log "⏳ Aguardando inicialização (porta 5000)..."
cd "$BASE_DIR/index/site" && nohup python3 main.py >> "$SITE_LOG" 2>&1 &
sleep 3
log "✓ Servidor do site iniciado com sucesso"

log "✅ Deploy finalizado com sucesso!"
log "📊 Logs salvos em: $LOG_DIR"
log "🌐 Site disponível em: http://localhost:5000 http://192.168.0.103:5000/ https://kendricknicoleti.com/"