# ⚙️ Back-end Flask e Sistema de Logs

Este documento explora a arquitetura do back-end do projeto "Suite", construído em Python utilizando o microframework Flask, com foco no roteamento, proteção e auditoria de acessos.

## 1. O Servidor Principal (`main.py`)

O arquivo `site/main.py` atua como o servidor web da aplicação. Diferente de aplicações Flask tradicionais que renderizam templates pesados no servidor (Server-Side Rendering), o "Suite" usa o Flask principalmente como um servidor de arquivos estáticos super-rápido com camadas de segurança adicionais.

### 1.1. Configuração do Flask
O aplicativo é instanciado apontando tanto a pasta de templates quanto a pasta estática para o diretório atual (`.`). Isso permite que o Flask sirva o `index.html` e todos os assets (`/assets`, `/css`, `/js`) diretamente da raiz do projeto clonado.

### 1.2. Roteamento Básico
A rota raiz (`/`) simplesmente renderiza o `index.html`. Todas as outras rotas de arquivos estáticos são tratadas automaticamente pelo Flask, mas o script implementa uma lógica especial no hook `@app.before_request`.

## 2. O Middleware de Segurança (`@app.before_request`)

Antes de qualquer requisição ser processada, o Flask executa a função `security_and_tracking()`. Esta função atua como um porteiro (middleware) e realiza quatro tarefas cruciais:

### 2.1. Tratamento de Favicon
Se a requisição for para `favicon.ico` ou `favicon.png`, o servidor intercepta e tenta servir o arquivo correto a partir de `assets/DEVS/favicon/Favicon.ico`. Se não encontrar, retorna um código HTTP 204 (No Content) para evitar erros 404 desnecessários no log.

### 2.2. Otimização de Arquivos Estáticos
Para melhorar a performance do servidor e reduzir o tamanho do log, o script ignora (retorna imediatamente) requisições para extensões conhecidas (`.css`, `.js`, `.png`, etc.) e pastas estáticas (`/assets`, `/css`). Isso significa que apenas requisições de páginas HTML e chamadas de API passam pela lógica de Rate Limiting e Logging.

### 2.3. Rate Limiting no Servidor (Defesa Ativa)
O servidor mantém um dicionário em memória (`request_counts`) que rastreia o IP de cada visitante (`request.remote_addr`).
*   **A Regra**: Se um IP fizer mais de 10 requisições (`RATE_LIMIT_COUNT`) em uma janela de 10 segundos (`RATE_LIMIT_PERIOD`), a requisição é bloqueada.
*   **A Punição**: O servidor retorna o arquivo HTML de erro `429.html` (da pasta `maintenance`) com o status HTTP 429 (Too Many Requests).
*   **O Log**: O bloqueio é registrado no arquivo de log diário com a tag `⚠️ BLOQUEIO`.

### 2.4. Contagem de Visitas em Tempo Real
O servidor mantém contadores globais em memória (`visitas_total` e `visitas_hoje`).
*   A cada requisição válida (que passou pelas etapas anteriores), os contadores são incrementados.
*   O servidor verifica se o dia virou (`hoje != data_atual`). Se sim, zera o contador `visitas_hoje`.
*   A função `atualizar_linha()` imprime o status atualizado no console (stdout) usando `\r` para sobrescrever a linha, criando um painel de monitoramento em tempo real no terminal.

## 3. Sistema de Logs Rotativos

O "Suite" possui um sistema de auditoria (logging) personalizado que não depende do log padrão do Flask (Werkzeug).

### 3.1. Estrutura de Diretórios de Log
Os logs não são salvos na pasta `site/`, mas sim em uma pasta `logs/` na raiz do projeto (`index/logs/`). Isso garante que os logs sobrevivam ao processo de deploy (onde a pasta `site/` é apagada e recriada pelo `start.sh`).

### 3.2. Rotação Diária
A função `get_log_file()` cria dinamicamente uma subpasta com a data de hoje (ex: `logs/2026-04-24/`) e retorna o caminho para o arquivo `site_access.log`. Isso evita que um único arquivo de log cresça infinitamente, facilitando a análise e o arquivamento.

### 3.3. O Que é Registrado?
A função `registrar_log(mensagem)` abre o arquivo do dia em modo *append* (`'a'`) e grava:
*   A hora exata (`[HH:MM:SS]`).
*   Acessos normais: `👤 Acesso: {IP} -> {Rota}`.
*   Bloqueios do Rate Limiter: `⚠️ BLOQUEIO: IP {IP} excedeu o limite`.
*   Erros 404 (Página não encontrada): `❓ 404: {Rota} (IP: {IP})`.
*   Exceções Críticas (Erro 500): `❌ 500: {Mensagem de Erro}`.

## 4. Tratamento de Erros Personalizado (`@app.errorhandler`)

O Flask está configurado para interceptar erros HTTP comuns (400, 401, 403, 404, 405, 429, 500, 502, 503, 504). Em vez de mostrar a página de erro feia padrão do Flask, ele serve arquivos HTML customizados localizados na pasta `maintenance/` (ex: `maintenance/404.html`). Isso mantém a identidade visual do site mesmo quando algo dá errado.

---
*Documento gerado automaticamente pela IA de análise de código.*
