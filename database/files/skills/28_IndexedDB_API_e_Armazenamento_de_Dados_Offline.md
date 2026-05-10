# Skill: PWA para Android: IndexedDB API e Armazenamento de Dados Offline

## Introdução

Esta skill explora a **IndexedDB API**, uma ferramenta fundamental para Progressive Web Apps (PWAs) que precisam de armazenamento robusto e persistente de dados no lado do cliente, especialmente para funcionalidades offline no Android. Enquanto o `[[04_Estrategias_de_Cache_com_Service_Workers]]` (Cache Storage API) é ideal para armazenar recursos de rede (HTML, CSS, JS, imagens), a IndexedDB é projetada para armazenar grandes volumes de dados estruturados, como objetos JavaScript, registros de usuários, configurações de aplicativos, ou dados de conteúdo dinâmico. Isso permite que as PWAs funcionem de forma confiável mesmo sem conexão com a internet, oferecendo uma experiência de usuário fluida e contínua.

Abordaremos o funcionamento da API, seus conceitos de banco de dados NoSQL, como criar e gerenciar bancos de dados e stores de objetos, realizar operações CRUD (Criar, Ler, Atualizar, Deletar) e usar índices para consultas eficientes. Discutiremos as considerações de performance, as limitações e as melhores práticas para sua implementação. Este conhecimento é fundamental para IAs que precisam projetar PWAs que dependem de acesso a dados offline, garantindo que o conteúdo esteja sempre disponível e que a aplicação seja responsiva, independentemente do estado da rede em dispositivos Android.

## Glossário Técnico

*   **IndexedDB API**: Uma API JavaScript para um sistema de banco de dados transacional NoSQL no navegador, permitindo o armazenamento de grandes quantidades de dados estruturados no lado do cliente.
*   **Banco de Dados NoSQL**: Um tipo de banco de dados que fornece um mecanismo para armazenamento e recuperação de dados que não usa o modelo tabular de bancos de dados relacionais.
*   **Object Store**: Uma coleção de registros em um banco de dados IndexedDB, similar a uma tabela em um banco de dados relacional, mas que armazena objetos JavaScript.
*   **Índice**: Uma forma de organizar os dados em um object store para permitir consultas rápidas e eficientes com base em uma propriedade específica dos objetos.
*   **Transação**: Uma operação atômica que garante que um conjunto de operações de leitura/escrita seja concluído com sucesso ou que todas sejam revertidas em caso de falha, mantendo a integridade dos dados.
*   **Chave (Key)**: Um valor único que identifica um registro em um object store.
*   **Cursor**: Um mecanismo para iterar sobre os registros em um object store ou índice, permitindo a recuperação de dados em ordem.
*   **`IDBFactory`**: A interface principal para acessar o IndexedDB, geralmente `window.indexedDB`.
*   **`IDBDatabase`**: Representa um banco de dados IndexedDB.
*   **`IDBObjectStore`**: Representa um object store dentro de um banco de dados.
*   **`IDBTransaction`**: Representa uma transação em um banco de dados.

## Conceitos Fundamentais

### 1. O que é IndexedDB e por que usá-lo em PWAs?

A IndexedDB é um banco de dados NoSQL do lado do cliente, o que significa que ele armazena dados diretamente no navegador do usuário. Diferente do `localStorage` (que é síncrono e limitado a strings), a IndexedDB é assíncrona, baseada em eventos e pode armazenar grandes quantidades de dados estruturados (objetos JavaScript, blobs, arrays). Para PWAs, isso é crucial para:

*   **Funcionalidade Offline**: Armazenar dados essenciais para que a PWA possa funcionar mesmo sem conexão.
*   **Performance**: Acessar dados localmente é muito mais rápido do que fazer requisições de rede.
*   **Persistência**: Os dados armazenados na IndexedDB são persistentes e não são apagados quando o navegador é fechado, a menos que o usuário os limpe explicitamente ou o sistema operacional precise de espaço.

**Mecanismos Internos**: A IndexedDB opera com um modelo de banco de dados orientado a objetos. Você cria bancos de dados, e dentro deles, `object stores`. Cada `object store` contém objetos JavaScript. As operações são realizadas dentro de `transações`, garantindo a integridade dos dados. A API é assíncrona e baseada em eventos (`IDBRequest` e `IDBTransaction`), o que significa que as operações não bloqueiam o thread principal da UI.

### 2. Abrindo e Criando um Banco de Dados

O primeiro passo é abrir (ou criar) um banco de dados IndexedDB. Isso é feito usando `indexedDB.open()`. A criação de object stores e índices ocorre no evento `onupgradeneeded`.

```javascript
// No thread principal ou Service Worker
let db = null;
const DB_NAME = "myPwaDatabase";
const DB_VERSION = 1;
const STORE_NAME = "items";

async function openDatabase() {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("Erro ao abrir o banco de dados:", event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      console.log("Banco de dados aberto com sucesso.");
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const dbUpgrade = event.target.result;
      console.log("Upgrade de banco de dados necessário.");

      // Criar object store se não existir
      if (!dbUpgrade.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = dbUpgrade.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
        // Criar índices para consultas eficientes
        objectStore.createIndex("name", "name", { unique: false });
        objectStore.createIndex("category", "category", { unique: false });
        console.log(`Object Store '${STORE_NAME}' e índices criados.`);
      }
    };
  });
}

// Exemplo de uso:
// openDatabase().then(database => {
//   console.log("Database instance:", database);
// }).catch(error => {
//   console.error("Falha ao inicializar IndexedDB:", error);
// });
```

**Comentários Exaustivos**: `indexedDB.open(DB_NAME, DB_VERSION)` tenta abrir o banco de dados. Se o banco de dados não existir ou a `DB_VERSION` for maior que a versão atual, o evento `onupgradeneeded` é disparado. Dentro deste evento, `dbUpgrade.createObjectStore()` é usado para criar object stores. `keyPath` define qual propriedade do objeto será usada como chave primária. `autoIncrement: true` gera chaves automaticamente. `createIndex()` cria índices para otimizar consultas.

### 3. Operações CRUD (Criar, Ler, Atualizar, Deletar)

Todas as operações de dados na IndexedDB são realizadas dentro de transações. Uma transação pode ser de leitura (`"readonly"`) ou de leitura/escrita (`"readwrite"`).

```javascript
// Continuando do exemplo anterior
async function addData(item) {
  const db = await openDatabase();
  const transaction = db.transaction([STORE_NAME], "readwrite");
  const objectStore = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = objectStore.add(item);

    request.onsuccess = () => {
      console.log("Item adicionado com sucesso:", item);
      resolve(request.result);
    };

    request.onerror = (event) => {
      console.error("Erro ao adicionar item:", event.target.error);
      reject(event.target.error);
    };

    transaction.oncomplete = () => console.log("Transação de adição concluída.");
    transaction.onabort = () => console.error("Transação de adição abortada.");
  });
}

async function getData(id) {
  const db = await openDatabase();
  const transaction = db.transaction([STORE_NAME], "readonly");
  const objectStore = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = objectStore.get(id);

    request.onsuccess = () => {
      console.log("Item lido com sucesso:", request.result);
      resolve(request.result);
    };

    request.onerror = (event) => {
      console.error("Erro ao ler item:", event.target.error);
      reject(event.target.error);
    };
  });
}

async function updateData(item) {
  const db = await openDatabase();
  const transaction = db.transaction([STORE_NAME], "readwrite");
  const objectStore = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = objectStore.put(item);

    request.onsuccess = () => {
      console.log("Item atualizado com sucesso:", item);
      resolve(request.result);
    };

    request.onerror = (event) => {
      console.error("Erro ao atualizar item:", event.target.error);
      reject(event.target.error);
    };
  });
}

async function deleteData(id) {
  const db = await openDatabase();
  const transaction = db.transaction([STORE_NAME], "readwrite");
  const objectStore = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = objectStore.delete(id);

    request.onsuccess = () => {
      console.log("Item deletado com sucesso:", id);
      resolve();
    };

    request.onerror = (event) => {
      console.error("Erro ao deletar item:", event.target.error);
      reject(event.target.error);
    };
  });
}

// Exemplo de uso:
// addData({ name: "Maçã", category: "Frutas" }).then(id => {
//   getData(id).then(item => {
//     item.quantity = 10;
//     updateData(item);
//   });
// });
```

**Comentários Exaustivos**: `db.transaction([STORE_NAME], "readwrite")` cria uma transação. O segundo argumento define o modo da transação. `objectStore.add()` adiciona um novo objeto. `objectStore.get()` recupera um objeto pela chave. `objectStore.put()` atualiza um objeto existente ou adiciona um novo se a chave não existir. `objectStore.delete()` remove um objeto. Todas essas operações retornam um `IDBRequest`, que é assíncrono e usa eventos `onsuccess` e `onerror`.

### 4. Consultas com Índices e Cursors

Índices permitem consultar dados de forma eficiente por propriedades que não são a chave primária. Cursors permitem iterar sobre os resultados de uma consulta.

```javascript
// Continuando do exemplo anterior
async function getItemsByCategory(category) {
  const db = await openDatabase();
  const transaction = db.transaction([STORE_NAME], "readonly");
  const objectStore = transaction.objectStore(STORE_NAME);
  const categoryIndex = objectStore.index("category"); // Usar o índice 'category'

  return new Promise((resolve, reject) => {
    const items = [];
    const request = categoryIndex.openCursor(IDBKeyRange.only(category));

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        items.push(cursor.value);
        cursor.continue();
      } else {
        console.log(`Itens na categoria '${category}':`, items);
        resolve(items);
      }
    };

    request.onerror = (event) => {
      console.error("Erro ao buscar itens por categoria:", event.target.error);
      reject(event.target.error);
    };
  });
}

// Exemplo de uso:
// getItemsByCategory("Frutas").then(fruits => console.log(fruits));
```

**Comentários Exaustivos**: `objectStore.index("category")` obtém o índice criado anteriormente. `categoryIndex.openCursor(IDBKeyRange.only(category))` abre um cursor que itera apenas sobre os itens onde a propriedade `category` corresponde ao valor fornecido. `cursor.continue()` avança o cursor para o próximo item. `IDBKeyRange` permite definir faixas de chaves para consultas (e.g., `IDBKeyRange.lowerBound`, `IDBKeyRange.upperBound`, `IDBKeyRange.bound`).

## Histórico e Evolução

A IndexedDB foi desenvolvida para substituir o Web SQL Database, que foi descontinuado devido à falta de um padrão único. Ela oferece uma solução mais flexível e poderosa para armazenamento de dados no lado do cliente.

*   **2010**: IndexedDB é proposta como uma alternativa ao Web SQL Database.
*   **2013**: IndexedDB se torna uma recomendação do W3C.
*   **Presente**: Continuação do desenvolvimento e aprimoramento, com foco em melhorias de performance e usabilidade.

## Exemplos Práticos e Casos de Uso

*   **Aplicativos de Notas/Tarefas Offline**: Armazenar notas, listas de tarefas e configurações do usuário para acesso offline.
*   **Aplicativos de E-commerce**: Armazenar dados de produtos, histórico de pedidos e carrinho de compras para uma experiência de compra offline.
*   **Aplicativos de Mídia**: Armazenar metadados de vídeos, músicas ou livros, e até mesmo os próprios arquivos de mídia (usando `Blob`s) para consumo offline.
*   **Aplicativos de Edição de Documentos**: Salvar rascunhos e versões de documentos editados offline.
*   **Sincronização de Dados**: Usar IndexedDB em conjunto com a `[[07_Sincronizacao_em_Segundo_Plano_Background_Sync]]` para sincronizar dados com o servidor quando a conectividade for restaurada.

## Análise de Fluxo e Diagramas (em Texto)

### Fluxo de Operação CRUD com IndexedDB

```mermaid
graph TD
    A[PWA (Android)] --> B[PWA solicita operação de dados (e.g., adicionar item)]
    B --> C[PWA chama `indexedDB.open()` (se DB não estiver aberto)]
    C --> D[DB é aberto/atualizado (`onupgradeneeded` para criar stores/índices)]
    D --> E[PWA cria `IDBTransaction` (readwrite/readonly)]
    E --> F[PWA obtém `IDBObjectStore`]
    F --> G[PWA executa operação (add, get, put, delete)]
    G --> H[IndexedDB processa a requisição assincronamente]
    H --> I[IndexedDB dispara evento `onsuccess` ou `onerror`]
    I --> J[PWA lida com o resultado (atualiza UI, trata erro)]
    J --> K[Transação é concluída (`oncomplete`)]
```

**Explicação**: Este diagrama ilustra o fluxo de uma operação CRUD na IndexedDB. A PWA (A) inicia uma operação (B). O banco de dados é aberto (C, D), e uma transação é criada (E). A PWA obtém o object store (F) e executa a operação (G). A IndexedDB processa a requisição assincronamente (H), disparando eventos de sucesso ou erro (I). A PWA lida com o resultado (J), e a transação é concluída (K).

## Boas Práticas e Padrões de Projeto

*   **HTTPS Obrigatório**: IndexedDB só funciona em contextos seguros (HTTPS).
*   **Assíncrono por Natureza**: Lembre-se que todas as operações IndexedDB são assíncronas. Use Promises ou `async/await` para gerenciar o fluxo de controle.
*   **Transações**: Sempre execute operações de leitura e escrita dentro de transações. Entenda os modos `"readonly"` e `"readwrite"`.
*   **Gerenciamento de Versões**: Use o `DB_VERSION` para gerenciar migrações de esquema. Todas as alterações de esquema (criação/exclusão de object stores ou índices) devem ocorrer no evento `onupgradeneeded`.
*   **Tratamento de Erros**: Implemente tratamento de erros robusto para `IDBRequest` e `IDBTransaction` para lidar com falhas de forma graciosa.
*   **Índices para Consultas**: Crie índices em propriedades que serão frequentemente usadas para consultas para otimizar o desempenho.
*   **Limpeza de Dados**: Implemente uma estratégia para limpar dados antigos ou não utilizados para evitar o consumo excessivo de espaço de armazenamento do usuário.
*   **Bibliotecas Auxiliares**: Considere usar bibliotecas como `idb` (uma pequena biblioteca que envolve a IndexedDB em Promises) ou `Dexie.js` (um wrapper mais completo) para simplificar o código e melhorar a ergonomia da API.

## Comparativos Detalhados

| Característica           | IndexedDB                                          | Cache Storage API                                  | localStorage / sessionStorage                      |
| :----------------------- | :------------------------------------------------- | :------------------------------------------------- | :------------------------------------------------- |
| **Tipo de Dados**        | Estruturados (objetos JS, Blobs, Arrays)           | Respostas HTTP (recursos de rede)                  | Strings (pares chave-valor)                        |
| **Tamanho Limite**       | Grande (geralmente gigabytes, depende do navegador/SO) | Grande (geralmente gigabytes)                      | Pequeno (5-10 MB)                                  |
| **Síncrono/Assíncrono**  | Assíncrono                                         | Assíncrono                                         | Síncrono                                           |
| **Acesso**               | Via API IndexedDB (eventos/Promises)               | Via Service Worker (principalmente)                | Direto (`window.localStorage`)                     |
| **Casos de Uso**         | Dados de aplicativos, conteúdo offline, sincronização | Recursos estáticos, assets, respostas de API       | Preferências do usuário, tokens de sessão          |
| **Complexidade Dev**     | Média/Alta                                         | Média                                              | Baixa                                              |
| **Transações**           | Sim                                                | Não                                                | Não                                                |

## Ferramentas e Recursos

*   **Documentação Oficial**:
    *   [MDN Web Docs - IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) [1]
    *   [Google Developers - IndexedDB](https://web.dev/indexeddb/) [2]
*   **Bibliotecas Auxiliares**:
    *   [idb](https://github.com/jakearchibald/idb): Um wrapper leve para IndexedDB baseado em Promises.
    *   [Dexie.js](https://dexie.org/): Um wrapper mais completo e poderoso para IndexedDB.
*   **Ferramentas de Debugging**:
    *   **Chrome DevTools**: A aba "Application" > "IndexedDB" permite inspecionar bancos de dados, object stores e dados armazenados.

## Tópicos Avançados e Pesquisa Futura

*   **IndexedDB e Web Workers**: Como usar IndexedDB de forma eficiente dentro de Web Workers para realizar operações de dados em segundo plano sem bloquear a UI.
*   **Sincronização de Dados com o Servidor**: Estratégias para manter os dados da IndexedDB sincronizados com um banco de dados remoto, usando `[[07_Sincronizacao_em_Segundo_Plano_Background_Sync]]`.
*   **IndexedDB e `Blob`s**: Armazenar arquivos binários (imagens, vídeos) diretamente na IndexedDB como `Blob`s.

## Perguntas Frequentes (FAQ)

*   **P: A IndexedDB é um banco de dados relacional?**
    *   R: Não, a IndexedDB é um banco de dados NoSQL orientado a objetos. Embora você possa criar índices e simular algumas relações, ela não possui o modelo de tabelas, chaves estrangeiras e SQL de um banco de dados relacional tradicional.
*   **P: Os dados na IndexedDB são seguros?**
    *   R: Os dados armazenados na IndexedDB são seguros no sentido de que são isolados por origem (apenas a PWA que os armazenou pode acessá-los) e são persistentes. No entanto, eles não são criptografados por padrão. Para dados altamente sensíveis, você precisaria implementar sua própria camada de criptografia antes de armazená-los.

## Cenários de Aplicação Real (Case Studies)

*   **Case Study 1: Google Docs (PWA)**
    *   **Desafio**: O Google Docs precisa permitir que os usuários criem e editem documentos offline, com a capacidade de sincronizar as alterações quando a conexão for restaurada.
    *   **Solução**: Embora o Google Docs seja um aplicativo complexo, uma PWA com IndexedDB poderia armazenar o conteúdo dos documentos, metadados e histórico de revisões localmente. Quando o usuário está offline, ele pode continuar trabalhando, e as alterações são salvas na IndexedDB. Quando a conexão é restabelecida, a PWA usa a `[[07_Sincronizacao_em_Segundo_Plano_Background_Sync]]` para enviar as alterações para o servidor e baixar as atualizações.
    *   **Resultados**: Uma experiência de edição de documentos robusta e confiável, mesmo em ambientes offline, demonstrando o poder da IndexedDB para aplicações de produtividade que exigem persistência de dados complexos.
    *   **Referências**: [Google Docs](https://docs.google.com/)

## Referências

[1] [MDN Web Docs - IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
[2] [Google Developers - IndexedDB](https://web.dev/indexeddb/)
[3] [W3C Indexed Database API Specification](https://www.w3.org/TR/IndexedDB/)
[4] [idb GitHub](https://github.com/jakearchibald/idb)
[5] [Dexie.js](https://dexie.org/)
[6] [MDN Web Docs - Cache Storage API](https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage)
[7] [MDN Web Docs - Web Storage API (localStorage/sessionStorage)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
