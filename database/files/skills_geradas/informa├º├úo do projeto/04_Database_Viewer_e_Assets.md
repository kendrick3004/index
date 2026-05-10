# 🗂️ Database Viewer e Gerenciamento de Assets

Este documento detalha o funcionamento do "Database Viewer" do projeto Suite, uma interface web que permite navegar, visualizar e gerenciar os arquivos estáticos e skills do projeto.

## 1. Visão Geral do Database Viewer

O Database Viewer (localizado em `site/database/`) é uma aplicação Single Page Application (SPA) em Vanilla JS que simula um explorador de arquivos de sistema operacional dentro do navegador. Ele lê um arquivo JSON pré-gerado (`file_structure.json`) para construir a árvore de diretórios e exibir os arquivos de forma interativa.

## 2. Estrutura de Arquivos e Assets

Os arquivos que o visualizador gerencia estão localizados em `site/database/assets/`. Esta pasta contém diversas subpastas:
*   `dev/`: Assets de desenvolvimento (ícones SVG, favicon, imagens de perfil, dados JSON como o calendário).
*   `skills/`: A base de conhecimento do projeto (arquivos Markdown).
*   `utilidades/`: Arquivos executáveis, instaladores e documentos úteis.

## 3. O Gerador de Estrutura (`generate_assets_structure.py`)

Para que o front-end saiba quais arquivos existem sem precisar de um back-end dinâmico listando diretórios, o projeto utiliza um script Python para gerar um mapa estático.

### 3.1. Funcionamento do Script
O script `generate_assets_structure.py` percorre recursivamente a pasta `assets` (ignorando a subpasta `sets`).
1.  **Coleta de Metadados**: Para cada arquivo encontrado, a função `get_file_info()` coleta:
    *   Caminho relativo (`id` e `path`).
    *   Nome do arquivo.
    *   Tamanho em bytes (`stat.st_size`).
    *   Extensão e uma categoria de tipo genérica (`image`, `pdf`, `archive`, `code`, `video`, `audio`, `font`, `file`).
    *   Timestamp de modificação (`stat.st_mtime`).
    *   Se for imagem, define o caminho para preview.
2.  **Estruturação do JSON**: O script organiza esses dados em um dicionário onde a chave é o caminho relativo da pasta (ex: `dev/icons`) ou `root` para a pasta base. Cada entrada contém listas de `folders` (subpastas) e `files` (arquivos).
3.  **Saída**: O dicionário é salvo como `file_structure.json` no diretório `site/database/`.

## 4. O Front-end do Viewer (`app.js`)

O arquivo `app.js` consome o `file_structure.json` e renderiza a interface.

### 4.1. Estado Global
O aplicativo mantém o estado em variáveis globais:
*   `currentPath`: O diretório atual sendo visualizado (ex: `root` ou `dev/icons`).
*   `fileStructure`: O objeto JSON completo carregado na inicialização.
*   `files`: A lista combinada de pastas e arquivos do diretório atual.
*   `selectedFiles`: Um array com os IDs dos arquivos selecionados pelo usuário.
*   `viewMode`: O modo de visualização atual (`grid` ou `list`).

### 4.2. Fluxo de Navegação
1.  **Inicialização**: O aplicativo carrega o JSON e calcula recursivamente o tamanho total de cada pasta (`calculateFolderSizes()`), somando os tamanhos de todos os arquivos e subpastas.
2.  **Roteamento (History API)**: O visualizador suporta navegação sem recarregar a página usando `window.history.pushState()`. A função `loadFilesFromPath()` atualiza o `currentPath`, filtra os arquivos correspondentes no JSON, reconstrói o *breadcrumb* (trilha de navegação) e chama `renderFiles()`.
3.  **Renderização**: A função `renderFiles()` limpa o contêiner e desenha a interface (grade ou tabela) com base no `viewMode`.
    *   **Ícones**: Arquivos recebem ícones baseados em sua extensão (`getFileIcon()`), utilizando SVGs inline seguros.
    *   **Previews**: Imagens possuem suporte a miniaturas.
    *   **Seleção**: Checkboxes permitem selecionar múltiplos arquivos.

### 4.3. Interatividade e Visualização
*   **Clique em Pasta**: Chama `loadFilesFromPath()` com o novo caminho.
*   **Clique em Arquivo**: Abre um modal de pré-visualização (`preview-modal`).
    *   Se for imagem, exibe a imagem em tamanho maior.
    *   Se for código (JS, CSS, HTML, Python, etc.) ou texto (Markdown, TXT), o visualizador tenta fazer um `fetch()` do arquivo e exibir seu conteúdo em um bloco `<pre><code>`.
    *   Outros tipos exibem um ícone genérico com a opção de download.

## 5. Limitações e Segurança

*   **Download em Lote**: A interface possui um botão "Baixar Selecionados", mas a implementação atual (segundo análise do código) apenas exibe um alerta de que o download via ZIP não está disponível, sugerindo o download individual.
*   **Segurança (XSS)**: O relatório de auditoria (`SECURITY_AUDIT.md`) apontou o uso de `.innerHTML` na construção do breadcrumb em versões anteriores. Embora o código atual tente mitigar isso usando `document.createElement()` e `createTextNode()`, a injeção de HTML direto ainda é um ponto de atenção se o `file_structure.json` for manipulado.

---
*Documento gerado automaticamente pela IA de análise de código.*
