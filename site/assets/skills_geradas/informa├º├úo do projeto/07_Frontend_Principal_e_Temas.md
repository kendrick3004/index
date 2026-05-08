# 🎨 Frontend Principal e Gerenciamento de Temas

Este documento explora a arquitetura do front-end principal do projeto "Suite", focando na estrutura HTML, na lógica de inicialização e no sistema de temas (Dark/Light Mode).

## 1. Estrutura Base (`index.html`)

A página principal do projeto (`site/index.html`) atua como um contêiner para os diversos módulos da aplicação.

### 1.1. Metadados e Carregamento Dinâmico
O `<head>` do documento é enxuto. Ele carrega os favicons e delega a maior parte da configuração de metadados (SEO, Open Graph) para o script `factory.js`. As variáveis de ambiente (chaves de API) são carregadas primeiro via `env-loader.js`.

### 1.2. Layout Principal (`.container`)
O corpo da página é estruturado em blocos funcionais dentro de uma div `.container`:
*   **Avatar**: Exibe a foto de perfil (`avatar.jpg`) e o nome de usuário (ex: `@kendricknicoleti`).
*   **Switch de Tema**: Um controle visual (toggle) com ícones de sol e lua para alternar entre os modos claro e escuro.
*   **Santo do Dia**: Um card dinâmico preenchido pelo `santo-do-dia.js`.
*   **Links e Liturgia**: Uma seção com links de navegação (ex: para o Database Viewer) e o menu interativo da Liturgia das Horas.
*   **Clima (Footer)**: A área inferior da tela reservada para o widget de clima, gerido pelo `weather.js`.

## 2. Inicialização e Estado (`suite.js`)

O arquivo `site/pages/suite/suite.js` contém o módulo principal (`SuiteModule`) que orquestra a inicialização da página e o estado da sessão.

### 2.1. Sessão do Usuário
O módulo mantém um objeto de sessão no `sessionStorage` (para dados que duram apenas enquanto a aba estiver aberta) e um objeto de tema no `localStorage` (para persistência entre visitas).
*   **Contador de Cliques**: O código possui lógica para contar quantas vezes o usuário clicou no toggle de tema (um possível "easter egg" desativado).
*   **Easter Egg de Login**: Há um atalho de teclado global (`Ctrl+Shift+A`) configurado no `index.html` que redireciona o usuário para a página de administração (`/pages/login`).

## 3. Sistema de Temas (Dark/Light Mode)

O projeto "Suite" possui um sistema de temas robusto que afeta tanto o CSS quanto os assets dinâmicos (como o fundo do widget de clima).

### 3.1. Variáveis CSS (`modes.css`)
O arquivo `site/src/styles/modes.css` define as variáveis de cor (Custom Properties) para ambos os temas.
*   O seletor `:root` define as cores do tema escuro (Dark Mode) por padrão, estabelecendo-o como o visual primário da aplicação.
*   O seletor `body.light-mode` sobrescreve essas variáveis com as cores do tema claro.

### 3.2. Lógica de Alternância (Toggle)
O `SuiteModule` gerencia a interação com o botão de tema:
1.  **Carregamento Inicial**: Ao abrir a página, o script lê a preferência salva no `localStorage` sob a chave `suite_theme_preference`. Se não houver, assume o modo escuro.
2.  **Aplicação**: A função `applyTheme()` adiciona ou remove a classe `light-mode` do elemento `<body>`. Ela também atualiza visualmente a posição do switch (movendo o círculo do toggle).
3.  **Sincronização entre Abas**: O script ouve o evento `storage` da janela. Se o usuário mudar o tema em uma aba do navegador, as outras abas do projeto "Suite" abertas são atualizadas instantaneamente.

## 4. Estilização Global (`suite.css`)

O arquivo `site/pages/suite/suite.css` define o layout base.
*   Utiliza Flexbox para centralizar o `.container` e distribuir os elementos verticalmente.
*   Aplica um design estilo "Glassmorphism" (transparência e desfoque) nos cards e botões, utilizando `backdrop-filter: blur()`.
*   As cores de fundo, texto e bordas são referenciadas através das variáveis definidas no `modes.css` (ex: `var(--bg-color)`, `var(--text-primary)`), garantindo que a troca de tema seja fluida e não exija recarregamento da página.

---
*Documento gerado automaticamente pela IA de análise de código.*
