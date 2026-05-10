# PWA para Android: Service Workers e Estratégias de Cache

## Introdução
Esta skill foca no "cérebro" de uma PWA: o **Service Worker**. Sem ele, uma PWA é apenas um site comum. Com ele, o app ganha vida offline, notificações push e sincronização em segundo plano.

## Glossário Técnico
*   **Service Worker**: Script que roda em segundo plano, separado da página principal.
*   **Cache Storage API**: Armazenamento para pares Request/Response.
*   **Fetch Event**: Evento disparado para cada requisição de rede.

## Conceitos Fundamentais
O Service Worker atua como um proxy entre o navegador e a rede. Ele intercepta requisições e decide se deve retornar algo do cache ou buscar na rede.

### Subtópico 1.1: O Ciclo de Vida do Service Worker
1.  **Registro**: O navegador é informado sobre o script.
2.  **Instalação**: Momento de pré-armazenar o App Shell.
3.  **Ativação**: Limpeza de caches antigos.

### Subtópico 1.2: Estratégias de Cache
*   **Cache-First**: Busca no cache primeiro, rede depois. Ideal para ativos estáticos.
*   **Network-First**: Busca na rede primeiro, cache como fallback. Ideal para dados dinâmicos.
*   **Stale-While-Revalidate**: Retorna do cache e atualiza em segundo plano.

## Exemplos Práticos
```javascript
// Exemplo de Cache-First no Service Worker
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
```

## Referências Cruzadas
*   O Service Worker é um tipo de `[[JavaScript: Web Workers]]`.
*   A segurança exige `[[Web Security: HTTPS]]`.
