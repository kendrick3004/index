# ⚡ Frontend JavaScript e Lógica Neural

Este documento explora a arquitetura e a filosofia do código JavaScript no projeto "Suite", focando em como ele atua como o "Sistema Nervoso Central" da interface.

## 1. A Filosofia Vanilla JS

O projeto "Suite" adota uma abordagem deliberada de utilizar **Vanilla JavaScript** (JavaScript puro, sem frameworks como React, Angular ou Vue). Essa escolha arquitetônica tem implicações profundas na performance, manutenção e na forma como o código é estruturado.

### 1.1. Padrão de Módulo (IIFE)
Para evitar a poluição do escopo global (variáveis vazando e sobrescrevendo umas às outras), o projeto utiliza o **Padrão de Módulo** implementado através de *Immediately Invoked Function Expressions* (IIFE).

```javascript
const MeuModulo = (function() {
    'use strict';
    
    // Variáveis e funções privadas
    let estadoInterno = 0;
    function logicaPrivada() { ... }

    // API Pública
    return {
        iniciar: function() { ... }
    };
})();
```
Módulos como `WeatherModule` (`weather.js`) e `SaintModule` (`santo-do-dia.js`) seguem esse padrão, garantindo que suas lógicas internas de cache e formatação estejam isoladas e seguras.

### 1.2. Manipulação Direta do DOM
Sem um Virtual DOM (como no React), o JavaScript do Suite interage diretamente com a árvore do documento (DOM).
*   **Seleção**: Uso extensivo de `document.querySelector()` e `document.getElementById()`.
*   **Event Delegation**: O código (especialmente no `database/app.js`) frequentemente anexa ouvintes de eventos (`addEventListener`) a elementos pai para gerenciar cliques em múltiplos filhos dinâmicos (como a lista de arquivos), otimizando a memória.

## 2. Assincronismo e Fluxo de Dados

A interface do Suite é altamente dependente de dados externos (WeatherAPI, Firebase, arquivos JSON locais).

### 2.1. A API `fetch` e `async/await`
O projeto moderno substituiu callbacks e `XMLHttpRequest` por `Promises` e a sintaxe `async/await`. Isso torna o fluxo assíncrono legível e estruturado.
*   O módulo de clima (`weather.js`) usa `async function fetchWeather()` para buscar dados da API e, em caso de falha (`try/catch`), recorrer ao cache local.
*   O Database Viewer (`app.js`) usa `await fetch("file_structure.json")` para carregar a árvore de arquivos antes de renderizar a interface.

### 2.2. Eventos Customizados (Comunicação Inter-módulos)
Como os módulos são isolados, eles precisam de uma forma de se comunicar sem criar acoplamento forte. O Suite utiliza a API de Eventos do DOM (`CustomEvent`).
*   Quando o usuário marca uma oração no `liturgy.js`, o script salva o dado e dispara um evento global: `window.dispatchEvent(new CustomEvent('prayerDataUpdated', { detail: mergedData }))`.
*   O calendário anual (`calendar.js`) e o sincronizador do Firebase (`firebase-sync.js`) escutam esse evento (`window.addEventListener('prayerDataUpdated', ...)`) e atualizam suas respectivas interfaces ou enviam os dados para a nuvem, sem precisarem saber *quem* disparou a mudança.

## 3. O Dicionário Atômico de JavaScript

A base de conhecimento do projeto (`database/assets/skills/JS_LOGIC_NEURAL_ENGINE.md`) documenta as práticas recomendadas e a lógica profunda do JS, servindo como guia para a IA e para os desenvolvedores.

### 3.1. Variáveis e Escopo (`let` vs `const`)
O guia enfatiza o uso moderno de `const` para valores imutáveis (referências de objetos, elementos do DOM) e `let` para valores que mudam, abolindo o uso do `var` para evitar vazamentos de escopo.

### 3.2. Estruturas de Dados (Arrays e Objetos)
O processamento de dados (como a formatação do nome de múltiplos santos no calendário litúrgico) depende fortemente de métodos funcionais de Array:
*   `.map()`: Transforma dados (ex: aplicando a função `sanitize` a cada nome de santo).
*   `.filter()`: Remove dados indesejados.
*   `.reduce()`: Agrega valores (embora menos comum na interface principal, é vital em lógicas complexas de dados).

## 4. Segurança no Cliente (XSS)

A manipulação direta do DOM traz o risco de injeção de scripts (Cross-Site Scripting - XSS). O projeto adota práticas de sanitização.

### 4.1. O Perigo do `.innerHTML`
A auditoria de segurança (`SECURITY_AUDIT.md`) identificou o uso de `.innerHTML` como uma vulnerabilidade potencial se os dados de origem (como o `file_structure.json` ou a API de clima) forem comprometidos.

### 4.2. A Solução: Sanitização
Onde `.innerHTML` é necessário (ex: para renderizar quebras de linha `<br>` nos nomes dos santos), o código utiliza uma função auxiliar `sanitize()`:
```javascript
function sanitize(str) {
    if (!str) return '';
    const temp = document.createElement('div');
    temp.textContent = str; // Escapa as tags HTML
    return temp.innerHTML;  // Retorna a string segura
}
```
Isso garante que qualquer tag `<script>` maliciosa vinda de uma API seja convertida em texto inofensivo antes de ser injetada na página.

---
*Documento gerado automaticamente pela IA de análise de código.*
