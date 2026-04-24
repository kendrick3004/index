#!/bin/bash

# Setup inicial do ambiente para o site
set -e

echo "================================================"
echo "🚀 Iniciando instalação de dependências e setup"
echo "================================================"

# Atualiza repositórios
echo "[1/3] Atualizando pacotes do sistema..."
sudo apt update

# Instala pacotes do sistema solicitados e essenciais
echo "[2/3] Instalando pacotes base (nano, curl, wget, openssh-server, net-tools, git, python3, python3-pip)..."
sudo apt install -y nano curl wget openssh-server net-tools git python3 python3-pip python3-venv

# Verifica se o repositório principal já existe, senão faz o clone
BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
SITE_DIR="$BASE_DIR/site"


# Instalação das dependências Python
echo "[3/3] Instalando dependências do Python (Flask)..."
# Cria um ambiente virtual (opcional mas recomendado) ou instala globalmente
sudo pip3 install Flask

echo "================================================"
echo "✅ Setup concluído com sucesso!"
echo "Para iniciar o site em modo normal, execute: ./start.sh"
echo "Para iniciar em modo manutenção, execute: ./start_maintenance.sh"
echo "================================================"
