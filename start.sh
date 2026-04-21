#!/bin/bash

# Pega o diretório onde o script está localizado (raiz do projeto /index)
BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_BASE_DIR="$BASE_DIR/logs"
HOJE=$(date +%Y-%m-%d)
DIA_LOG_DIR="$LOG_BASE_DIR/$HOJE"

# Cria pastas de logs se não existirem
mkdir -p "$DIA_LOG_DIR"

echo "📂 Diretório Base: $BASE_DIR"
cd "$BASE_DIR" || exit

echo "🛑 Parando qualquer servidor em execução..."
pkill -f main.py
sleep 2

echo "🚧 Iniciando modo manutenção..."
if [ -d "$BASE_DIR/maintenance" ]; then
    cd "$BASE_DIR/maintenance" || exit
    nohup python3 main.py >> "$DIA_LOG_DIR/maintenance_system.log" 2>&1 &
    cd "$BASE_DIR" || exit
    sleep 3
else
    echo "❌ Erro: Pasta maintenance não encontrada!"
fi

echo "🧹 LIMPANDO TUDO DA PASTA SITE..."
# Apaga a pasta site completamente para garantir um download limpo
rm -rf "$BASE_DIR/site"

echo "📥 Baixando versão completa do GitHub..."
# Baixa tudo do zero do repositório para a pasta 'site' dentro de 'index'
git clone https://github.com/kendrick3004/site.git "$BASE_DIR/site"

echo "📂 Entrando na pasta do site..."
if [ -d "$BASE_DIR/site" ]; then
    cd "$BASE_DIR/site" || exit
    
    echo "⚙️ Gerando estrutura de assets..."
    if [ -f "database/generate_assets_structure.py" ]; then
        cd database || exit
        python3 generate_assets_structure.py
        cd .. || exit
    fi

    echo "🛑 Finalizando modo manutenção..."
    pkill -f main.py
    sleep 2

    echo "🚀 Iniciando servidor principal do site..."
    # Inicia site e joga log para a pasta do dia
    nohup python3 main.py >> "$DIA_LOG_DIR/site_system.log" 2>&1 &
    echo "✅ Deploy finalizado! Site online na porta 5000."
else
    echo "❌ Erro: Falha ao baixar o site do GitHub!"
fi

echo "📊 Logs do dia salvos em: $DIA_LOG_DIR"
