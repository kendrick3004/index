# 🎨 Padrões de Design e Código: Projeto Suite

Este documento descreve os padrões de design (Design Patterns) e as convenções de código adotadas no projeto "Suite", focando em modularidade, encapsulamento e performance.

## 1. Padrão de Módulo (Module Pattern - IIFE)

Para evitar conflitos no escopo global do navegador, todos os scripts principais (`weather.js`, `santo-do-dia.js`, `suite.js`) utilizam o padrão de **Função Imediatamente Invocada (IIFE)**.

```javascript
const WeatherModule = (function() {
    'use strict';
    
    // Privado: Variáveis de configuração e estado interno
    const CONFIG = { ... };
    
    // Privado: Funções de processamento
    function fetchWeather() { ... }
    
    // Público: Apenas o método de inicialização é exposto
    return {
        init: function() {
            fetchWeather();
        }
    };
})();
```

## 2. Padrão de Observador (Observer Pattern / Custom Events)

O Suite utiliza **Eventos Customizados** para permitir que módulos independentes se comuniquem sem estarem diretamente acoplados.

- **Gatilho**: O módulo `liturgy.js` dispara `prayerDataChanged` ao marcar uma oração.
- **Observadores**:
    - `firebase-sync.js` escuta para enviar os dados para a nuvem.
    - `calendar.js` escuta para atualizar a grade visual de progresso.

## 3. Padrão de Fábrica de Interface (UI Factory)

O script `factory.js` atua como uma fábrica centralizada para a construção dinâmica da interface.
- **Responsabilidade**: Injetar estilos, configurar meta-tags e preparar o "esqueleto" da página antes da execução da lógica de negócio.

## 4. Padrão de Proxy de Segurança (Rate Limiter)

O `rate-limiter.js` atua como um **Proxy** para as interações do usuário.
- Ele intercepta chamadas à API `fetch` e cliques em botões críticos.
- Se a frequência for muito alta, ele bloqueia a execução da ação original e redireciona para a página de erro 429.

## 5. Convenções de Interface (UI/UX)

### Glassmorphism
O design visual segue o padrão de "vidro fosco":
- `backdrop-filter: blur(10px)`
- Bordas semitransparentes.
- Cores de fundo baseadas em variáveis CSS (`var(--bg-card)`).

### Estados de Feedback
- **Loading**: Uso de placeholders ou ícones de carregamento enquanto APIs respondem.
- **Offline**: Banner persistente no topo/rodapé quando `navigator.onLine` é falso.
- **Sucesso**: Transições suaves de cor nos botões de oração (classe `.done`).

## 6. Hierarquia de Configurações

O projeto resolve configurações na seguinte ordem de prioridade:
1.  **Parâmetros de URL** (ex: `?debug=true`).
2.  **LocalStorage** (Preferências salvas do usuário).
3.  **Variáveis de Ambiente** (Carregadas via `env-loader.js`).
4.  **Defaults de Código** (Valores padrão definidos nos módulos).

## 7. Tratamento de Erros e Fallbacks

```javascript
try {
    await fetchFromAPI();
} catch (error) {
    console.warn("API falhou, recorrendo ao cache local...");
    loadFromLocalStorage();
    showOfflineUI();
}
```
Este padrão de **Graceful Degradation** garante que o dashboard nunca fique completamente vazio para o usuário.

---
*Documento adaptado para refletir os padrões de engenharia de software do projeto Suite.*
