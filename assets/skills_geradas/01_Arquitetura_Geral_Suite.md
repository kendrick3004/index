# 🏛️ Arquitetura Geral do Projeto "Suite"

Este documento detalha a arquitetura de alto nível do projeto "Suite", um dashboard pessoal com foco em ferramentas utilitárias, clima, liturgia e visualização de banco de dados.

## 1. Visão Geral

O projeto "Suite" é uma aplicação híbrida que combina um back-end leve em Python (Flask) para roteamento, segurança e logs, com um front-end robusto baseado em HTML, CSS e JavaScript (Vanilla) que consome APIs externas (WeatherAPI, Firebase) e arquivos estáticos locais (JSON).

O sistema foi desenhado para ser altamente resiliente, possuindo suporte offline (via LocalStorage), sincronização em tempo real (via Firebase Realtime Database) e um modo de manutenção embutido.

## 2. Estrutura de Diretórios

A estrutura do repositório reflete a separação de responsabilidades:

*   `/site`: Contém o código-fonte principal da aplicação em produção.
    *   `/src`: Scripts e estilos base (configurações, Firebase, atualizador).
    *   `/pages`: Módulos específicos da interface (Login, Calendário Litúrgico, Homepage).
    *   `/database`: O visualizador de arquivos ("Database Viewer") e seus assets.
*   `/maintenance`: Uma versão isolada do site servida quando o sistema principal está fora do ar ou em atualização.
*   `/logs`: Diretório gerado dinamicamente para armazenar acessos e erros diários.
*   `start.sh` / `setup.sh`: Scripts de automação de deploy, ambiente e clonagem (Sparse Checkout).

## 3. Componentes Principais

### 3.1. Servidor Flask (Back-end)
O arquivo `site/main.py` serve como o roteador principal. Suas funções incluem:
*   **Servir Arquivos Estáticos**: Entrega HTML, CSS e JS.
*   **Rate Limiting**: Bloqueia IPs que excedem 10 requisições a cada 10 segundos, retornando a página de erro `429.html`.
*   **Logging**: Registra acessos e erros em arquivos de log diários (`/logs/YYYY-MM-DD/site_access.log`).
*   **Tratamento de Erros**: Redireciona erros (400, 404, 500) para páginas amigáveis localizadas na pasta `/maintenance`.

### 3.2. Front-end Dinâmico (Vanilla JS)
A interface é construída sem frameworks reativos complexos (como React ou Vue), utilizando Padrões de Módulo (IIFE) para encapsular a lógica.
*   **Gerenciamento de Estado**: Utiliza extensivamente o `localStorage` para manter preferências (tema dark/light), cache de clima e status de orações.
*   **Segurança no Cliente**: Um script `rate-limiter.js` atua como primeira barreira contra cliques excessivos, interceptando a API `fetch` e cliques rápidos.
*   **Temas e Cores**: Gerenciados dinamicamente via variáveis CSS (Custom Properties) que são alternadas pelo JavaScript (`modes.css`).

### 3.3. Integração com Firebase
O projeto utiliza o Firebase (versão compat 10.8.0) para:
*   **Autenticação**: Login via E-mail/Senha ou Google OAuth (Popup).
*   **Realtime Database**: Sincronização bidirecional do status das orações litúrgicas. O módulo `firebase-sync.js` garante que as mudanças locais sejam enviadas para a nuvem e vice-versa.

## 4. Fluxo de Dados e Resiliência

1.  **Carregamento**: O `env-loader.js` carrega as chaves de API (Firebase, WeatherAPI).
2.  **Renderização**: O HTML estrutural é desenhado, seguido pela injeção de estilos via `factory.js`.
3.  **Hidratação**: Os módulos JS (`weather.js`, `santo-do-dia.js`, `liturgy.js`) buscam dados no `localStorage`.
4.  **Atualização (Network)**: Em paralelo, os módulos tentam buscar dados frescos (APIs ou JSON local). Se falharem (offline), a interface continua funcionando com os dados cacheados e exibe banners de aviso.

## 5. Cérebro de Conhecimento (Skills)

Uma característica notável do "Suite" é a presença de um "Cérebro de Conhecimento" (`database/assets/skills/`). O projeto atua não apenas como uma aplicação, mas como um repositório de conhecimento técnico (Markdown) interconectado, projetado para servir de base de dados para o treinamento de Inteligências Artificiais.

---
*Documento gerado automaticamente pela IA de análise de código.*
