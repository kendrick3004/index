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

echo "[3/3] Ativando o Cloudflared Tunnel"
sudo pkill cloudflared
sudo cloudflared service uninstall
sudo rm -f /etc/init.d/cloudflared
sudo rm -rf /etc/cloudflared
sudo apt remove --purge cloudflared -y
sudo apt autoremove -y
rm -rf ~/.cloudflared
# Add cloudf
# Add cloudflare gpg key
sudo mkdir -p --mode=0755 /usr/share/keyrings
curl -fsSL https://pkg.cloudflare.com/cloudflare-public-v2.gpg | sudo tee /usr/share/keyrings/cloudflare-public-v2.gpg >/dev/null

# Add this repo to your apt repositories
echo 'deb [signed-by=/usr/share/keyrings/cloudflare-public-v2.gpg] https://pkg.cloudflare.com/cloudflared any main' | sudo tee /etc/apt/sources.list.d/cloudflared.list

# install cloudflared
sudo apt-get update && sudo apt-get install cloudflared
sudo mkdir -p --mode=0755 /usr/share/keyrings
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null

# Add this repo to your apt repositories
echo 'deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared any main' | sudo tee /etc/apt/sources.list.d/cloudflared.list

# install cloudflared
sudo apt-get update && sudo apt-get install cloudflared -y
# O comando abaixo pode falhar se o serviço já estiver instalado ou se o token for inválido/expirado
cloudflared tunnel run --token eyJhIjoiOWNjZGQzMjk0NDllMzJhZWU4YzRkYWRkMDZjOGM0NzciLCJ0IjoiNWJjMjkyOTEtMzdmYi00ZTAwLWJjN2EtZjlmYmYzNzJkMDM3IiwicyI6Ik1tVTVPR0kyTlRndFkyRmtNUzAwTm1RNExXRmpZamd0TjJObE1UTTRNVEkwTXpRMyJ9
echo "================================================"
echo "✅ Setup concluído com sucesso!"
echo "Executando: ./start.sh"
# Corrigido: usando caminho relativo ao diretório do script
cd "$(dirname "$0")"
echo "================================================"
