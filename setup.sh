#!/bin/bash

# Setup inicial do ambiente para o site
set -e

echo "================================================"
echo "🚀 Iniciando instalação de dependências e setup"
echo "================================================"

# Atualiza repositórios
echo "[1/3] Atualizando pacotes do sistema..."
sudo apt update && sudo apt upgrade -y

# Instala pacotes do sistema solicitados e essenciais
echo "[2/3] Instalando pacotes base (nano, curl, wget, openssh-server, net-tools, git, python3, python3-pip)..."
sudo apt install -y nano curl wget openssh-server net-tools git python3 python3-pip python3-venv 
sudo apt install python3 python3-pip python3-venv -y

echo "[3/3] Ativando o Cloudflared Tunnel"
# Add cloudflare gpg key
sudo mkdir -p --mode=0755 /usr/share/keyrings
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null

# Add this repo to your apt repositories
echo 'deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared any main' | sudo tee /etc/apt/sources.list.d/cloudflared.list

# install cloudflared
sudo apt-get update && sudo apt-get install cloudflared
sudo cloudflared service install eyJhIjoiOWNjZGQzMjk0NDllMzJhZWU4YzRkYWRkMDZjOGM0NzciLCJ0IjoiOTU5Njg0NDUtYzBhNS00M2RhLTk1ZDctYzYxY2I0YzU3NzZjIiwicyI6Ik5HWmlPRFF3WVRJdFpHUTNaaTAwWkdOakxUa3dZV1F0WkdRME5qbGhZV1E0TkRreU5XSXpZVGsyTW1FdE1XWmxPUzAwTjJGa0xUbG1Oek10TkdWbU9EQTVOV0ppWXpkbCJ9
echo "================================================"
echo "✅ Setup concluído com sucesso!"
echo "Executando: ./start.sh"
cd /index
echo "================================================"
