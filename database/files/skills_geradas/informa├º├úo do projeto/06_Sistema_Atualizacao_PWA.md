# 🔄 Sistema de Atualização (Update System)

Este documento detalha o funcionamento do sistema de atualização cliente-servidor do projeto Suite, projetado para forçar atualizações silenciosas sem desconectar o usuário.

## 1. Visão Geral (`update.js`)

O arquivo `site/src/app/update.js` contém a lógica responsável por garantir que os usuários (especialmente aqueles que instalaram o site como PWA ou o acessam via atalho no celular) recebam a versão mais recente do código, superando o cache agressivo do navegador.

Apesar da documentação citar que o PWA foi removido para evitar problemas de cache (como visto em `SECURITY_AND_BRAIN_AUDIT.md`), o sistema de atualização possui resquícios de lógica de Service Worker (`setupServiceWorkerUpdate`), atuando como um "fallback" e verificador ativo de versão.

## 2. Lógica de Verificação de Versão

O coração do sistema é a função `checkVersion()`.
1.  **Gatilho**: Ela é disparada alguns segundos após o carregamento da página, *apenas* se o usuário estiver acessando o site em modo standalone (instalado no celular).
2.  **Busca**: Ela faz um `fetch` do arquivo `/src/app/version.json`, anexando um parâmetro de timestamp (`?t=...`) para burlar o cache.
3.  **Comparação**: A versão recebida é comparada com a constante `CURRENT_VERSION` (hardcoded no `update.js`). A função `isNewerVersion()` quebra a string de versão (ex: `3.3.0`) em partes numéricas para saber se a versão do servidor é maior.
4.  **Ação**: Se uma versão mais nova for detectada, o sistema aciona a atualização do Service Worker (se existir) ou recarrega a página forçando a limpeza do cache (`window.location.reload(true)`).

## 3. Limpeza Seletiva de Dados (`clearInterfaceData`)

Um dos maiores desafios de forçar um recarregamento limpando o cache é não perder o estado de login do usuário. O projeto resolve isso com a função `clearInterfaceData()`.

### 3.1. O Problema
Se você limpa o `localStorage` inteiro, o usuário é deslogado do Firebase e perde suas configurações.

### 3.2. A Solução (Preservação de Chaves)
O módulo define um array `PRESERVE_KEYS` que contém as chaves que não devem ser apagadas (ex: tokens do Firebase, timestamp de autenticação).
1.  **Backup**: O script itera sobre o `localStorage` e salva em memória os valores das chaves que estão na lista `PRESERVE_KEYS`.
2.  **Limpeza Total**: O `localStorage` é completamente limpo (`localStorage.clear()`).
3.  **Restauração**: Os valores salvos no passo 1 são recolocados no `localStorage`.
4.  **Limpeza de Bancos**: O script também apaga bancos de dados do IndexedDB (`suite_db` e `firebaseLocalStorageDb`) e o `sessionStorage` para garantir que nenhuma lógica antiga permaneça em memória.

## 4. Integração com o Service Worker

A função `setupServiceWorkerUpdate()` monitora o ciclo de vida do Service Worker (caso ele seja reativado no futuro):
*   Se um novo SW for instalado e estiver aguardando ativação (`registration.waiting`), o script chama `updateReady()`.
*   A função `updateReady()` envia uma mensagem `SKIP_WAITING` para o novo SW, forçando-o a assumir o controle imediatamente, sem esperar que o usuário feche todas as abas.
*   Quando o SW assume o controle (`controllerchange`), a função `clearInterfaceData()` é acionada e a página recarregada.

---
*Documento gerado automaticamente pela IA de análise de código.*
