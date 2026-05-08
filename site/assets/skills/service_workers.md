# PWA: Service Workers

## Introdução

Service Workers são o motor que impulsiona a inteligência e a confiabilidade de um Progressive Web App (PWA). Eles são scripts JavaScript que o navegador executa em segundo plano, independentemente da página web aberta. Isso permite funcionalidades revolucionárias como cache de rede interceptado (permitindo funcionamento offline), notificações push e sincronização em segundo plano. Sem Service Workers, um PWA seria apenas um site comum sem a capacidade de responder a condições de rede instáveis. Para um entendimento mais aprofundado sobre o funcionamento de proxies e a arquitetura de rede, consulte `[[Redes de Computadores: Fundamentos]]`.

## Glossário Técnico

*   **Service Worker**: Script em segundo plano que atua como um proxy de rede programável.
*   **Event Loop**: O mecanismo de execução do JavaScript que o Service Worker utiliza para gerenciar tarefas assíncronas.
*   **Scope**: O diretório e as subpáginas que um Service Worker pode controlar.
*   **Cache Storage API**: API para armazenar pares de requisição/resposta de rede de forma persistente.
*   **Interceptação de Fetch**: A capacidade do Service Worker de capturar todas as requisições de rede feitas pela página e decidir como respondê-las.
*   **Offline First**: Estratégia de design onde a aplicação prioriza o conteúdo local em cache sobre a rede.

## Conceitos Fundamentais

O Service Worker opera em um ciclo de vida rigoroso e isolado do DOM da página principal.

### Ciclo de Vida do Service Worker

1.  **Registro**: O script da página principal solicita o registro do Service Worker.
2.  **Instalação (`install`)**: Ocorre uma vez, ideal para pré-armazenar recursos estáticos no cache.
3.  **Ativação (`activate`)**: Ocorre após a instalação, usado para limpar caches antigos e preparar o ambiente.
4.  **Operação (`fetch`, `push`, `sync`)**: O Service Worker agora controla as páginas no seu escopo e responde a eventos.

### Estratégias de Cache Comuns

| Estratégia               | Descrição                                                                 | Caso de Uso Ideal                               |
| :----------------------- | :------------------------------------------------------------------------ | :---------------------------------------------- |
| **Cache First**          | Tenta o cache primeiro; se falhar, vai para a rede.                      | Recursos estáticos (CSS, JS, Imagens).          |
| **Network First**        | Tenta a rede primeiro; se falhar, usa o cache.                            | Dados dinâmicos (API de notícias, perfil).      |
| **Stale-While-Revalidate**| Serve do cache imediatamente, mas atualiza o cache em segundo plano.     | Feed social, avatares, conteúdo frequente.      |
| **Cache Only**           | Serve apenas do cache, nunca vai para a rede.                             | Recursos que nunca mudam ou modo offline total. |

## Exemplos Práticos

### Service Worker com Cache Inteligente

```javascript
const CACHE_NAME = 'app-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/main.js',
  '/style.css'
];

// Instalação: Pré-cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

// Interceptação: Cache First
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request);
    })
  );
});
```

## Boas Práticas

*   **Não use variáveis globais**: Service Workers são terminados e reiniciados constantemente; use IndexedDB ou Cache Storage para persistência.
*   **Tratamento de Erros**: Sempre inclua blocos `.catch()` em operações de rede para evitar falhas silenciosas que quebram a experiência offline.
*   **Atualização Gradual**: Use `self.skipWaiting()` com cautela para garantir que os usuários não vejam versões mistas de arquivos CSS/JS.

## Referências

[1] [Google Developers: Service Workers Primer](https://developer.chrome.com/docs/workbox/service-worker-overview/)
[2] [MDN Web Docs: Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
