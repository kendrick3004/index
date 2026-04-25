# 🚀 Sistema de Deploy, Manutenção e Segurança

Este documento aborda os processos de infraestrutura do projeto "Suite", incluindo o provisionamento de ambiente, scripts de inicialização, modo de manutenção e práticas de segurança.

## 1. Provisionamento de Ambiente (`setup.sh`)

O script `setup.sh` é o ponto de entrada para preparar o servidor Ubuntu (ou similar) para rodar o projeto.

### 1.1. Dependências do Sistema
O script executa uma série de comandos `apt` para instalar:
*   Ferramentas básicas: `nano`, `curl`, `wget`, `net-tools`, `git`.
*   Servidor SSH: `openssh-server`.
*   Ambiente Python: `python3`, `python3-pip`, `python3-venv`.

### 1.2. Túnel Cloudflare (Cloudflared)
O projeto utiliza o Cloudflare Tunnel para expor o servidor local à internet de forma segura, sem a necessidade de abrir portas no roteador ou ter um IP público estático.
1.  **Limpeza**: Remove instalações antigas do `cloudflared` e seus arquivos de configuração.
2.  **Instalação**: Instala a versão mais recente do `cloudflared`.
3.  **Serviço**: Instala o serviço do Cloudflare passando um token de autenticação específico (fornecido no script) que conecta a máquina ao painel do Cloudflare Zero Trust.

## 2. Inicialização e Atualização (`start.sh`)

O script `start.sh` é responsável por iniciar a aplicação, garantindo que o código esteja atualizado e a estrutura de dados gerada.

### 2.1. Modo de Manutenção Temporário
Antes de qualquer atualização, o script:
1.  Encerra instâncias antigas do `main.py`.
2.  Inicia um servidor Flask secundário localizado na pasta `maintenance/` na porta 5000. Isso garante que os usuários não vejam uma página de erro (502 Bad Gateway) enquanto o site principal está sendo baixado.

### 2.2. Clonagem com Sparse Checkout
O script apaga a pasta `site/` antiga e inicia um novo download do repositório GitHub.
*   **Otimização**: Utiliza `git clone --depth=1` (shallow clone) para baixar apenas o último commit, economizando banda e tempo.
*   **Sparse Checkout**: Após o clone, configura o repositório para manter apenas a pasta `site/` (e a `.git`), ignorando arquivos de desenvolvimento não necessários em produção.
*   **Resiliência**: Possui um loop de tentativas (até 3 vezes) caso o download falhe por timeout.

### 2.3. Geração do Banco de Dados
Após o download, o script entra na pasta `site/database/` e executa o `generate_assets_structure.py` para recriar o `file_structure.json` com base nos arquivos recém-baixados.

### 2.4. Transição Final
1.  Encerra o servidor de manutenção.
2.  Inicia o servidor principal (`nohup python3 main.py &`).
3.  Registra todos os passos em arquivos de log (`logs/YYYY-MM-DD/`).

## 3. Modo de Manutenção Dedicado (`start_maintenance.sh`)

Para períodos prolongados de indisponibilidade, o script `start_maintenance.sh` pode ser usado. Ele segue um fluxo semelhante ao `start.sh`, mas para no passo de iniciar o servidor da pasta `maintenance/` e limpa a pasta `site/` aguardando um futuro deploy.

### 3.1. O Servidor de Manutenção (`maintenance/main.py`)
É um aplicativo Flask simplificado que:
*   Retorna a página `503.html` para a rota raiz (`/`).
*   Para requisições `/api/*`, retorna um JSON informando que a API está ativa, permitindo que aplicativos clientes saibam do status.
*   Serve arquivos estáticos da pasta `maintenance/` (como `503.html`, CSS, imagens).

## 4. Segurança e Defesa

O projeto implementa múltiplas camadas de segurança, auditadas no documento `SECURITY_AUDIT.md`.

### 4.1. Rate Limiting no Cliente (`rate-limiter.js`)
Um script no front-end monitora a taxa de requisições do usuário.
*   **Mecanismo**: Intercepta cliques e chamadas `fetch`. Se o limite (10 requisições em 5 segundos) for excedido, o script bloqueia novas ações por 30 segundos e redireciona o usuário para a página `/429.html`.
*   **Limitação**: Sendo client-side, pode ser burlado desativando o JavaScript ou limpando o LocalStorage.

### 4.2. Rate Limiting no Servidor (`main.py`)
O back-end Flask possui sua própria implementação de Rate Limiting.
*   **Mecanismo**: Um dicionário `request_counts` armazena o número de requisições por IP (`request.remote_addr`).
*   **Ação**: Se um IP exceder 10 requisições em 10 segundos, o servidor retorna imediatamente a página `429.html` com o código HTTP 429 (Too Many Requests), protegendo a aplicação contra ataques DoS simples.

### 4.3. Cabeçalhos de Segurança (`_headers`)
O projeto utiliza um arquivo `_headers` (padrão Netlify/Cloudflare Pages) para configurar:
*   `X-Content-Type-Options: nosniff` (Previne MIME-sniffing).
*   `X-XSS-Protection: 1; mode=block` (Filtro XSS do navegador).
*   `X-Frame-Options: DENY` (Previne Clickjacking).
*   `Content-Security-Policy (CSP)`: Restringe as fontes permitidas para scripts, estilos, imagens e conexões de rede (ex: liberando apenas `www.gstatic.com`, `api.weatherapi.com`, etc.).

### 4.4. Prevenção de XSS
A auditoria (`SECURITY_AND_BRAIN_AUDIT.md`) recomendou a substituição de `.innerHTML` por `.textContent` na renderização de dados dinâmicos (como nomes de arquivos no Database Viewer e nomes de santos no calendário litúrgico) para evitar injeção de scripts maliciosos.

---
*Documento gerado automaticamente pela IA de análise de código.*
