---
name: javascript-pro
description: Use when developing interactive web applications, dynamic UIs, and client-side logic with modern JavaScript (ES6+). Generates optimized, maintainable, and performant JavaScript code, implements asynchronous patterns, manipulates the DOM efficiently, and integrates with APIs. Invoke for front-end development, interactive features, data fetching, and single-page application logic.
license: MIT
metadata:
  author: Manus AI
  version: "1.0.0"
  domain: frontend
  triggers: JavaScript, ES6+, DOM manipulation, AJAX, Fetch API, async/await, Promises, web interactivity, client-side logic, SPA development
  role: specialist
  scope: implementation
  output-format: code
  related-skills: html-expert, css-expert, react-expert, nodejs-expert, api-designer
---

# JavaScript Pro

Especialista em JavaScript moderno (ES6+), focado na criação de aplicações web interativas, dinâmicas e de alta performance no lado do cliente.

## Quando Usar Esta Skill

- Ao adicionar interatividade e dinamismo a páginas web.
- Para manipular o Document Object Model (DOM) e atualizar o conteúdo da página sem recarregar.
- Ao realizar requisições assíncronas para APIs (AJAX, Fetch API).
- Para construir Single Page Applications (SPAs) ou componentes interativos.
- Para otimizar o desempenho e a experiência do usuário em aplicações front-end.

## Core Workflow

1.  **Analisar Requisitos de Interatividade** — Entender as funcionalidades dinâmicas desejadas e a interação com o usuário.
2.  **Estruturar Código JavaScript** — Organizar o código em módulos, funções e classes para modularidade e manutenibilidade.
3.  **Manipular DOM** — Selecionar elementos, modificar conteúdo, atributos e estilos de forma eficiente.
4.  **Implementar Lógica Assíncrona** — Utilizar Promises, `async/await` para lidar com operações de rede e outras tarefas não bloqueantes.
5.  **Integrar com APIs** — Fazer requisições HTTP para buscar e enviar dados de/para servidores.
6.  **Otimizar Performance** — Minimizar o tempo de execução, evitar gargalos e garantir uma experiência fluida.
7.  **Testar e Depurar** — Escrever testes unitários e de integração, e usar ferramentas de depuração do navegador.

## Reference Guide

Carregar orientações detalhadas com base no contexto:

| Tópico                 | Referência                                   | Carregar Quando                                     |
|------------------------|----------------------------------------------|-----------------------------------------------------|
| Fundamentos JavaScript | `references/js-fundamentals.md`              | Variáveis, tipos, operadores, controle de fluxo      |
| Manipulação do DOM     | `references/dom-manipulation.md`             | Seletores, eventos, modificação de elementos         |
| JavaScript Assíncrono  | `references/async-js.md`                     | Promises, `async/await`, Callbacks, Event Loop      |
| Fetch API e AJAX       | `references/fetch-ajax.md`                   | Requisições HTTP, tratamento de respostas            |
| ES6+ Features          | `references/es6-features.md`                 | Arrow functions, classes, módulos, destructuring     |
| Gerenciamento de Estado | `references/state-management.md`             | Padrões de gerenciamento de estado em JS puro       |

## Constraints

### MUST DO
- Utilizar `const` e `let` em vez de `var`.
- Preferir Arrow Functions para funções anônimas e callbacks.
- Usar `async/await` para lidar com Promises de forma mais legível.
- Modularizar o código JavaScript usando módulos ES6 (`import`/`export`).
- Manipular o DOM de forma eficiente, minimizando reflows e repaints.
- Implementar tratamento de erros robusto para operações assíncronas.
- Escrever código limpo, legível e bem comentado.

### MUST NOT DO
- Poluir o escopo global com variáveis.
- Usar `eval()`.
- Bloquear o thread principal com operações síncronas demoradas.
- Fazer manipulações diretas do DOM em larga escala sem otimização.
- Ignorar o tratamento de erros em Promises ou `async/await`.
- Misturar lógica de negócios com manipulação de UI excessivamente.

## Code Examples

### Requisição Assíncrona com Fetch API e `async/await`
```javascript
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Erro ao buscar dados:", error);
        return null;
    }
}

// Exemplo de uso:
fetchData('https://api.example.com/data')
    .then(data => {
        if (data) {
            console.log("Dados recebidos:", data);
            // Manipular o DOM com os dados
            document.getElementById('data-container').textContent = JSON.stringify(data, null, 2);
        }
    });
```

### Manipulação do DOM e Event Listeners
```javascript
document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('myButton');
    const messageDiv = document.getElementById('message');

    if (button && messageDiv) {
        button.addEventListener('click', () => {
            messageDiv.textContent = 'Botão clicado!';
            messageDiv.style.color = 'blue';
        });
    }
});
```

### Módulos ES6
```javascript
// math.js
export function add(a, b) {
    return a + b;
}

export const PI = 3.14159;

// app.js
import { add, PI } from './math.js';

console.log(add(5, 3)); // 8
console.log(PI);      // 3.14159
```

## Knowledge Reference

ECMAScript Specification (ES6+), MDN Web Docs JavaScript, JavaScript.info, You Don't Know JS (book series), Promises/A+ specification, Event Loop, Web APIs (DOM, Fetch, etc.), Babel, Webpack, ESLint, Prettier.

## Output Templates

Ao implementar funcionalidades JavaScript, fornecer:
1.  Arquivo `.js` com código otimizado e bem estruturado.
2.  Breve explicação sobre a lógica implementada e padrões utilizados.
3.  Instruções de como integrar o script ao HTML (se necessário).

## Ferramentas e Recursos

*   **Documentação Oficial**:
    *   [MDN Web Docs - JavaScript](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
    *   [ECMAScript (ES6+) Compatibility Table](https://kangax.github.io/compat-table/es6/)
*   **Ferramentas de Desenvolvimento**:
    *   [Chrome DevTools](https://developer.chrome.com/docs/devtools/) (para depuração e perfil de performance)
    *   [VS Code](https://code.visualstudio.com/) (IDE com excelente suporte a JavaScript)
    *   [ESLint](https://eslint.org/) (para linting e garantia de qualidade de código)
    *   [Prettier](https://prettier.io/) (para formatação automática de código)
*   **Cursos e Tutoriais**:
    *   [JavaScript.info](https://javascript.info/)
    *   [freeCodeCamp - JavaScript Algorithms and Data Structures](https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/)

## Tópicos Avançados e Pesquisa Futura

- **WebAssembly (Wasm)**: Como integrar módulos de baixo nível compilados de outras linguagens para performance crítica.
- **Web Workers**: Execução de scripts em background para evitar bloqueio da UI em tarefas pesadas.
- **Service Workers**: Fundamentais para PWAs, permitindo caching offline, notificações push e sincronização em segundo plano.
- **WebSockets**: Comunicação bidirecional em tempo real entre cliente e servidor.
- **WebRTC**: Comunicação em tempo real peer-to-peer (áudio, vídeo, dados).
- **Frameworks e Bibliotecas**: Aprofundamento em React, Vue, Angular, Svelte para desenvolvimento de SPAs complexas.

## Perguntas Frequentes (FAQ)

*   **P: Qual a diferença entre `null` e `undefined` em JavaScript?**
    *   R: `undefined` significa que uma variável foi declarada, mas ainda não recebeu um valor, ou que uma propriedade de objeto não existe. É o valor padrão de variáveis não inicializadas. `null` é um valor de atribuição, significando a ausência intencional de qualquer valor de objeto. É um valor que um desenvolvedor pode atribuir para indicar que algo está vazio ou não existe. Em termos simples, `undefined` é 
