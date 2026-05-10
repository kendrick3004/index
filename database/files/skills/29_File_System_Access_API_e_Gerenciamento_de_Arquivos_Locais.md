# Skill: PWA para Android: File System Access API e Gerenciamento de Arquivos Locais

## Introdução

Esta skill explora a **File System Access API**, uma funcionalidade poderosa que permite que Progressive Web Apps (PWAs) no Android interajam diretamente com o sistema de arquivos local do usuário. Tradicionalmente, as aplicações web tinham acesso muito limitado aos arquivos do usuário, geralmente restrito a uploads e downloads temporários. Com a File System Access API, as PWAs podem abrir, ler, escrever e salvar arquivos e diretórios de forma persistente, proporcionando uma experiência de gerenciamento de arquivos que se aproxima muito da de um aplicativo nativo. Isso abre um vasto leque de possibilidades para casos de uso como editores de texto, editores de imagem, IDEs baseadas na web, e qualquer aplicação que precise manipular arquivos locais.

Abordaremos o funcionamento da API, o processo de solicitação de permissões para arquivos e diretórios, a leitura e escrita de conteúdo, e as considerações de segurança e privacidade. Discutiremos as melhores práticas para sua implementação e como ela se integra com outras APIs para criar uma experiência de usuário rica. Este conhecimento é fundamental para IAs que precisam projetar PWAs que ofereçam funcionalidades avançadas de manipulação de arquivos, permitindo que os usuários trabalhem com seus dados locais de forma eficiente e segura em dispositivos Android.

## Glossário Técnico

*   **File System Access API**: Uma API web que permite que as PWAs leiam, escrevam e gerenciem arquivos e diretórios no sistema de arquivos local do usuário, com permissão explícita.
*   **`window.showOpenFilePicker()`**: Método para solicitar ao usuário que selecione um ou mais arquivos para abrir.
*   **`window.showSaveFilePicker()`**: Método para solicitar ao usuário um local para salvar um arquivo.
*   **`window.showDirectoryPicker()`**: Método para solicitar ao usuário que selecione um diretório para acesso.
*   **`FileSystemFileHandle`**: Um objeto que representa um arquivo no sistema de arquivos local, permitindo acesso ao seu conteúdo.
*   **`FileSystemDirectoryHandle`**: Um objeto que representa um diretório no sistema de arquivos local, permitindo acesso aos seus arquivos e subdiretórios.
*   **`WritableStream`**: Um fluxo de dados para escrita de dados em um arquivo, obtido a partir de um `FileSystemFileHandle`.
*   **`ReadableStream`**: Um fluxo de dados para leitura de dados de um arquivo, obtido a partir de um `FileSystemFileHandle`.
*   **Permissões Persistentes**: Permissões concedidas pelo usuário que persistem entre sessões do navegador, permitindo que a PWA acesse arquivos/diretórios sem pedir novamente.

## Conceitos Fundamentais

### 1. O Desafio do Acesso a Arquivos Locais na Web

Historicamente, a web tem sido um ambiente restrito em termos de acesso ao sistema de arquivos local, principalmente por razões de segurança. Isso limitava o tipo de aplicações que poderiam ser construídas na web. A File System Access API quebra essa barreira, mas de forma segura, exigindo permissão explícita do usuário para cada operação de acesso a arquivos ou diretórios.

**Mecanismos Internos**: A API funciona através de "file handles" e "directory handles". Quando o usuário seleciona um arquivo ou diretório através de um seletor nativo do sistema operacional, a PWA recebe um handle para esse recurso. Esse handle é um objeto que permite à PWA interagir com o arquivo/diretório. As permissões são granulares (leitura ou leitura/escrita) e podem ser persistentes, o que significa que a PWA pode reter o acesso a um arquivo ou diretório específico entre sessões, desde que o usuário tenha concedido essa permissão.

### 2. Abrindo e Lendo Arquivos

Para abrir um arquivo, a PWA usa `window.showOpenFilePicker()`. Uma vez que o usuário seleciona o arquivo, a PWA obtém um `FileSystemFileHandle` e pode ler seu conteúdo.

```javascript
// Na PWA
async function openAndReadFile() {
  if (!("showOpenFilePicker" in window)) {
    console.warn("File System Access API não suportada neste navegador.");
    // Fallback para input[type="file"]
    return;
  }

  try {
    // 1. Solicitar ao usuário que selecione um arquivo
    const [fileHandle] = await window.showOpenFilePicker({
      types: [
        { description: "Arquivos de Texto", accept: { "text/plain": [".txt"] } },
        { description: "Arquivos HTML", accept: { "text/html": [".html", ".htm"] } },
        { description: "Arquivos de Imagem", accept: { "image/*": [".png", ".gif", ".jpeg", ".jpg"] } }
      ],
      multiple: false, // Permitir apenas um arquivo
    });

    // 2. Obter o arquivo do handle
    const file = await fileHandle.getFile();
    console.log("Arquivo selecionado:", file.name);

    // 3. Ler o conteúdo do arquivo
    const contents = await file.text(); // Ou file.arrayBuffer(), file.stream()
    console.log("Conteúdo do arquivo:", contents);

    // Armazenar o handle para acesso persistente (opcional)
    window.currentFileHandle = fileHandle;

  } catch (error) {
    console.error("Erro ao abrir/ler arquivo:", error);
  }
}

// Exemplo de como chamar a função
// document.getElementById("open-file-button").addEventListener("click", openAndReadFile);
```

**Comentários Exaustivos**: `window.showOpenFilePicker()` abre um seletor de arquivos nativo. O `types` array permite filtrar os tipos de arquivos que o usuário pode selecionar. O método retorna um array de `FileSystemFileHandle`s. `fileHandle.getFile()` retorna um objeto `File` padrão, que pode ser lido usando métodos como `file.text()`. O `fileHandle` pode ser armazenado para acesso futuro.

### 3. Salvando e Escrevendo Arquivos

Para salvar um arquivo, a PWA pode usar `window.showSaveFilePicker()` para obter um `FileSystemFileHandle` e, em seguida, escrever o conteúdo nele.

```javascript
// Na PWA
async function saveFile(content, suggestedName = "untitled.txt") {
  if (!("showSaveFilePicker" in window)) {
    console.warn("File System Access API não suportada neste navegador.");
    // Fallback para download tradicional
    return;
  }

  try {
    // 1. Solicitar ao usuário um local para salvar o arquivo
    const fileHandle = await window.showSaveFilePicker({
      suggestedName: suggestedName,
      types: [
        { description: "Arquivos de Texto", accept: { "text/plain": [".txt"] } },
      ],
    });

    // 2. Criar um WritableStream
    const writableStream = await fileHandle.createWritable();

    // 3. Escrever o conteúdo no stream
    await writableStream.write(content);

    // 4. Fechar o stream
    await writableStream.close();

    console.log("Arquivo salvo com sucesso:", fileHandle.name);

  } catch (error) {
    console.error("Erro ao salvar arquivo:", error);
  }
}

// Exemplo de como chamar a função
// document.getElementById("save-file-button").addEventListener("click", () => {
//   const editorContent = document.getElementById("editor").value;
//   saveFile(editorContent, "my-document.txt");
// });
```

**Comentários Exaustivos**: `window.showSaveFilePicker()` abre um seletor de "salvar como". `fileHandle.createWritable()` retorna um `WritableStream`, que é usado para escrever os dados. É crucial chamar `writableStream.close()` para garantir que todos os dados sejam gravados e os recursos sejam liberados.

### 4. Acessando Diretórios e Permissões Persistentes

A API também permite que a PWA acesse diretórios inteiros e mantenha permissões persistentes para arquivos e diretórios, o que é essencial para aplicações como IDEs.

```javascript
// Na PWA
let currentDirectoryHandle = null;

async function openDirectory() {
  if (!("showDirectoryPicker" in window)) {
    console.warn("File System Access API (showDirectoryPicker) não suportada.");
    return;
  }

  try {
    // 1. Solicitar ao usuário que selecione um diretório
    currentDirectoryHandle = await window.showDirectoryPicker();
    console.log("Diretório selecionado:", currentDirectoryHandle.name);

    // 2. Verificar e solicitar permissões de escrita (se necessário)
    const permissionStatus = await currentDirectoryHandle.queryPermission({ mode: "readwrite" });
    if (permissionStatus !== "granted") {
      const requestPermission = await currentDirectoryHandle.requestPermission({ mode: "readwrite" });
      if (requestPermission !== "granted") {
        console.warn("Permissão de escrita para o diretório negada.");
        return;
      }
    }

    // 3. Listar conteúdo do diretório
    for await (const entry of currentDirectoryHandle.values()) {
      console.log(`  ${entry.kind}: ${entry.name}`);
    }

    // Armazenar o handle para acesso persistente (opcional, via IndexedDB)
    // saveHandleToIndexedDB(currentDirectoryHandle);

  } catch (error) {
    console.error("Erro ao abrir diretório:", error);
  }
}

// Exemplo de como chamar a função
// document.getElementById("open-directory-button").addEventListener("click", openDirectory);
```

**Comentários Exaustivos**: `window.showDirectoryPicker()` abre um seletor de diretórios. `currentDirectoryHandle.queryPermission()` e `currentDirectoryHandle.requestPermission()` são usados para verificar e solicitar permissões de leitura/escrita. O loop `for await (const entry of currentDirectoryHandle.values())` permite iterar sobre os arquivos e subdiretórios dentro do diretório. Para persistir o acesso a um handle entre sessões, o handle pode ser armazenado em `IndexedDB`.

## Histórico e Evolução

A File System Access API é uma das APIs do `[[08_Capacidades_Nativas_e_Project_Fugu]]` que visa preencher a lacuna entre as capacidades da web e as de aplicativos nativos, permitindo acesso mais profundo ao sistema operacional de forma segura.

*   **2019**: A API é proposta como parte do Project Fugu.
*   **2020**: A API se torna amplamente disponível no Chrome para desktop e Android.
*   **Presente**: Continuação do desenvolvimento para melhorar a estabilidade, expandir para outros navegadores e adicionar mais funcionalidades.

## Exemplos Práticos e Casos de Uso

*   **Editores de Código Online**: Abrir projetos inteiros, editar arquivos e salvar alterações diretamente no sistema de arquivos local.
*   **Editores de Imagem/Vídeo**: Carregar imagens/vídeos grandes, processá-los e salvar os resultados sem a necessidade de uploads/downloads.
*   **Ferramentas de Produtividade**: Aplicações de notas, planilhas ou apresentações que trabalham com arquivos locais.
*   **Sistemas de Gerenciamento de Conteúdo (CMS) Offline**: Gerenciar conteúdo localmente e sincronizar com um servidor quando online.

## Análise de Fluxo e Diagramas (em Texto)

### Fluxo de Acesso a Arquivos com File System Access API

```mermaid
graph TD
    A[PWA (Android)] --> B[Usuário clica em "Abrir Arquivo" ou "Salvar Arquivo"]
    B --> C[PWA chama `showOpenFilePicker()` ou `showSaveFilePicker()`]
    C --> D[Navegador exibe seletor de arquivos/diretórios nativo]
    D --> E[Usuário seleciona arquivo/diretório e concede permissão]
    E --> F[PWA obtém `FileSystemFileHandle` ou `FileSystemDirectoryHandle`]
    F --> G{PWA quer Ler ou Escrever?}
    G -- Ler --> H[PWA obtém `File` do handle]
    H --> I[PWA lê conteúdo do `File`]
    G -- Escrever --> J[PWA cria `WritableStream` do handle]
    J --> K[PWA escreve conteúdo no stream]
    K --> L[PWA fecha `WritableStream`]
    I --> M[PWA processa dados]
    L --> M
    M --> N[PWA pode armazenar handle para acesso persistente]
```

**Explicação**: Este diagrama ilustra o fluxo de acesso a arquivos. O usuário inicia a operação (A-C), e o navegador exibe um seletor nativo (D). O usuário concede permissão (E), e a PWA obtém um handle (F). Para leitura (G-I), a PWA obtém o objeto `File` e lê seu conteúdo. Para escrita (G, J-L), a PWA cria um `WritableStream` e escreve os dados. Após o processamento (M), o handle pode ser armazenado para acesso persistente (N).

## Boas Práticas e Padrões de Projeto

*   **HTTPS Obrigatório**: A File System Access API só funciona em contextos seguros (HTTPS).
*   **Permissão do Usuário**: Sempre solicite permissão do usuário de forma clara e no momento certo. Explique por que o acesso a arquivos/diretórios é necessário.
*   **Fallback Gracioso**: Forneça um fallback para `input[type="file"]` e downloads tradicionais para navegadores que não suportam a API ou para usuários que negam as permissões.
*   **Gerenciamento de Erros**: Implemente tratamento de erros robusto para lidar com falhas de permissão, erros de leitura/escrita ou problemas de sistema de arquivos.
*   **Streams para Grandes Arquivos**: Use `ReadableStream` e `WritableStream` para lidar com arquivos grandes de forma eficiente, evitando carregar todo o conteúdo na memória de uma vez.
*   **Persistência de Permissões**: Para aplicações que precisam de acesso contínuo a um diretório (como um IDE), armazene o `FileSystemDirectoryHandle` em `IndexedDB` e solicite permissão persistente ao usuário.
*   **Evitar Bloqueio da UI**: Realize operações de arquivo em Web Workers para evitar bloquear o thread principal, especialmente ao lidar com arquivos grandes.

## Comparativos Detalhados

| Característica           | File System Access API (PWA)                       | `input[type="file"]` / `<a>` download            | Aplicativo Nativo (Android)                        |
| :----------------------- | :------------------------------------------------- | :------------------------------------------------- | :------------------------------------------------- |
| **Acesso a Arquivos**    | Leitura/Escrita persistente de arquivos/diretórios | Apenas leitura (upload), apenas escrita (download) | Leitura/Escrita completa do sistema de arquivos    |
| **Controle do Usuário**  | Alto (seleção explícita, permissões granulares)    | Médio (seleção de arquivo, local de download)      | Baixo (permissões de app, acesso amplo)            |
| **Segurança**            | Rigorosa (HTTPS, permissão explícita e granular)   | Rigorosa (isolamento por origem)                   | Gerenciado pelo sistema operacional, permissões de app |
| **Experiência do Usuário** | Nativa, fluida (seletores do SO)                   | Básica (pop-ups de upload/download)                | Nativa, integrada                                  |
| **Casos de Uso**         | Editores, IDEs, gerenciadores de arquivos          | Uploads de fotos, downloads de documentos          | Todos os casos de uso de manipulação de arquivos   |
| **Persistência**         | Sim (handles podem ser armazenados)                | Não (acesso temporário)                            | Sim                                                |

## Ferramentas e Recursos

*   **Documentação Oficial**:
    *   [MDN Web Docs - File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API) [1]
    *   [Google Developers - The File System Access API](https://web.dev/file-system-access/) [2]
*   **Ferramentas de Debugging**:
    *   **Chrome DevTools**: A aba "Application" > "File System" permite inspecionar os handles de arquivos e diretórios que a PWA tem acesso.

## Tópicos Avançados e Pesquisa Futura

*   **Integração com Web Workers**: Como usar a File System Access API de forma eficiente dentro de Web Workers para operações de arquivo em segundo plano.
*   **Sincronização de Arquivos**: Estratégias para sincronizar arquivos locais com serviços de nuvem usando esta API.
*   **Virtual File Systems**: Construir sistemas de arquivos virtuais sobre a API para abstrair a complexidade do sistema de arquivos real.

## Perguntas Frequentes (FAQ)

*   **P: A File System Access API permite que a PWA acesse qualquer arquivo no meu computador?**
    *   R: Não. A PWA só pode acessar os arquivos e diretórios que o usuário explicitamente seleciona através dos seletores nativos do sistema operacional. Ela não tem acesso irrestrito ao sistema de arquivos do usuário, garantindo a segurança e a privacidade.
*   **P: As permissões de acesso a arquivos são permanentes?**
    *   R: As permissões podem ser persistentes se o usuário conceder essa opção (geralmente através de uma caixa de diálogo "Lembrar esta escolha"). No entanto, o usuário sempre tem o controle e pode revogar essas permissões a qualquer momento através das configurações do navegador ou do sistema operacional.

## Cenários de Aplicação Real (Case Studies)

*   **Case Study 1: VS Code para Web (PWA)**
    *   **Desafio**: O Visual Studio Code, um dos IDEs mais populares, precisava oferecer uma experiência de desenvolvimento completa diretamente no navegador, permitindo que os usuários abrissem e editassem projetos locais.
    *   **Solução**: O VS Code para Web utiliza a File System Access API para permitir que os usuários abram pastas inteiras de projetos diretamente do seu sistema de arquivos local. Isso significa que os desenvolvedores podem usar o VS Code no navegador para editar seus arquivos de código, salvar alterações e até mesmo interagir com terminais, tudo sem a necessidade de instalar o aplicativo desktop.
    *   **Resultados**: Uma experiência de desenvolvimento poderosa e flexível, demonstrando como as PWAs podem se tornar ferramentas de produtividade de nível profissional, aproveitando o acesso direto ao sistema de arquivos local.
    *   **Referências**: [VS Code for the Web](https://vscode.dev/)

## Referências

[1] [MDN Web Docs - File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API)
[2] [Google Developers - The File System Access API](https://web.dev/file-system-access/)
[3] [W3C File System Access Specification](https://wicg.github.io/file-system-access/)
[4] [VS Code for the Web](https://vscode.dev/)
[5] [MDN Web Docs - Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API)
