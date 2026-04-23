#!/bin/bash

# Setup inicial do ambiente para o site
set -e

echo "================================================"
echo "🚀 Iniciando instalação de dependências e setup"
echo "================================================"

# Atualiza repositórios
echo "[1/4] Atualizando pacotes do sistema..."
sudo apt update

# Instala pacotes do sistema solicitados e essenciais
echo "[2/4] Instalando pacotes base (nano, curl, wget, openssh-server, net-tools, git, python3, python3-pip)..."
sudo apt install -y nano curl wget openssh-server net-tools git python3 python3-pip python3-venv

# Verifica se o repositório principal já existe, senão faz o clone
BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
SITE_DIR="$BASE_DIR/site"

echo "[3/4] Configurando repositório do site..."
if [ ! -d "$SITE_DIR" ]; then
    echo "Baixando repositório do GitHub..."
    git clone https://github.com/kendrick3004/site.git "$SITE_DIR"
else
    echo "Repositório já existe em $SITE_DIR. Atualizando..."
    cd "$SITE_DIR"
    git pull origin main || git pull origin master
    cd "$BASE_DIR"
fi

# Instalação das dependências Python
echo "[4/4] Instalando dependências do Python (Flask)..."
# Cria um ambiente virtual (opcional mas recomendado) ou instala globalmente
sudo pip3 install Flask

echo "================================================"
echo "✅ Setup concluído com sucesso!"
echo "Para iniciar o site em modo normal, execute: ./start.sh"
echo "Para iniciar em modo manutenção, execute: ./start_maintenance.sh"
echo "================================================"
