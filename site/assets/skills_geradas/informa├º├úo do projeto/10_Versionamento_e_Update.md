# 🔄 Versionamento e Sistema de Atualização (Update System)

Este documento detalha a estratégia de versionamento e o sistema de atualização do cliente (front-end) do projeto "Suite".

## 1. O Desafio do Cache Agressivo

Aplicações web modernas, especialmente aquelas que já foram Progressive Web Apps (PWAs) ou que são instaladas na tela inicial do celular ("Adicionar à Tela Inicial"), sofrem com um cache agressivo do navegador. Isso significa que, mesmo após o desenvolvedor atualizar o código no servidor (deploy), o usuário pode continuar vendo a versão antiga armazenada localmente.

O projeto "Suite" enfrentou esse problema. A documentação de auditoria (`SECURITY_AND_BRAIN_AUDIT.md`) indica que os Service Workers e o Manifest PWA foram removidos para evitar conflitos. No entanto, o sistema precisava de uma forma de garantir que os usuários sempre recebessem as correções mais recentes sem perder seus dados de sessão.

## 2. A Solução: O Módulo `update.js`

A resposta do projeto foi a criação do script `site/src/app/update.js`, um sistema de "Atualização Silenciosa e Limpeza Seletiva".

### 2.1. Versionamento (`version.json`)
O sistema baseia-se em um arquivo de controle de versão (`site/src/app/version.json`) hospedado no servidor. Este arquivo contém apenas um número de versão semântico (ex: `{"version": "3.3.0"}`).

### 2.2. A Lógica de Verificação (`checkVersion`)
O script `update.js` possui uma constante interna `CURRENT_VERSION` que reflete a versão do código em execução no navegador do usuário.
1.  **Gatilho**: A verificação não ocorre a cada clique para não sobrecarregar o servidor. Ela é acionada apenas quando o site é aberto como um aplicativo standalone (instalado no celular).
2.  **Busca sem Cache**: O script faz uma requisição `fetch` para o `version.json` do servidor, adicionando um timestamp à URL (`?t=...`) para garantir que o navegador não entregue uma versão em cache do arquivo de versão.
3.  **Comparação**: A função `isNewerVersion(current, remote)` quebra as strings de versão (ex: `3.3.0`) em arrays de números e compara cada segmento.
4.  **Ação**: Se a versão remota for maior que a versão local, o sistema decide que uma atualização forçada é necessária.

## 3. Limpeza Seletiva de Dados (`clearInterfaceData`)

A parte mais crítica do sistema de atualização é como ele lida com os dados locais do usuário antes de recarregar a página.

Se o script simplesmente chamasse `localStorage.clear()` para garantir que nenhum cache de interface sobrasse, o usuário seria deslogado do Firebase e perderia seu histórico de orações não sincronizado.

### 3.1. Preservação de Estado (A Lista Branca)
O módulo define um array `PRESERVE_KEYS`:
```javascript
const PRESERVE_KEYS = [
    'auth_user',              // Dados do usuário autenticado
    'auth_timestamp',         // Timestamp da autenticação
    'firebase_token',         // Token Firebase
    'suite_last_seen_version' // Versão vista pelo usuário
];
```

### 3.2. O Processo de Limpeza e Restauração
Quando uma atualização é detectada, a função `clearInterfaceData()` executa o seguinte fluxo:
1.  **Backup**: Ela itera sobre o `localStorage`. Se a chave atual estiver na lista `PRESERVE_KEYS`, seu valor é salvo em um objeto temporário na memória RAM.
2.  **Limpeza Total**: O `localStorage` inteiro é apagado.
3.  **Restauração**: O script percorre o objeto temporário e devolve as chaves preservadas ao `localStorage`.
4.  **Limpeza Adicional**: Para garantir uma atualização limpa, o script também tenta apagar bancos de dados do `IndexedDB` (como o cache interno do Firebase e o `suite_db`) e limpa o `sessionStorage`.

### 3.3. O Recarregamento Forçado
Após a limpeza seletiva, o script chama `window.location.reload(true)`. O parâmetro `true` (embora obsoleto em navegadores modernos) é uma tentativa de forçar o navegador a ignorar o cache HTTP e baixar os arquivos novos do servidor.

## 4. O Legado do Service Worker (`setupServiceWorkerUpdate`)

Embora a auditoria diga que o PWA foi removido, o `update.js` ainda contém código para lidar com Service Workers (`setupServiceWorkerUpdate()`).
*   Se o navegador detectar que um novo Service Worker foi instalado e está aguardando ativação (`registration.waiting`), o script envia uma mensagem `SKIP_WAITING`.
*   Isso força o novo Service Worker a assumir o controle da página imediatamente. Quando isso acontece (`controllerchange`), o script dispara a mesma rotina de limpeza seletiva (`clearInterfaceData`) e recarrega a página.

Isso sugere que o sistema foi projetado para ser resiliente, lidando tanto com atualizações baseadas em `version.json` (para clientes sem SW) quanto com atualizações via ciclo de vida do Service Worker.

---
*Documento gerado automaticamente pela IA de análise de código.*
