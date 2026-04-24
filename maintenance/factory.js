/**
 * ARQUIVO: 503/factory.js
 * DESCRIÇÃO: Versão simplificada para a página de erro 503.
 * VERSÃO: 1.0.0 - Standalone
 */

const SiteFactory = (function() {
    'use strict';

    const CONFIG = {
        title: "503 - Serviço Indisponível",
        description: "Estamos em manutenção. Por favor, tente novamente em breve.",
        author: "Kendrick Nicoleti",
        themeColor: "#1a1a1a",
        favicon: "favicon.png"
    };

    function injectMetadata() {
        const head = document.head;
        const metaTags = [
            { name: "description", content: CONFIG.description },
            { name: "author", content: CONFIG.author },
            { name: "robots", content: "noindex, nofollow" }
        ];

        metaTags.forEach(tag => {
            if (!document.querySelector(`meta[name="${tag.name}"]`)) {
                const meta = document.createElement('meta');
                meta.name = tag.name;
                meta.content = tag.content;
                head.appendChild(meta);
            }
        });
    }

    function initServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                // Tenta registrar o SW da raiz se disponível
                navigator.serviceWorker.register('/sw.js')
                    .then(reg => console.log('[503] SW registrado:', reg.scope))
                    .catch(err => console.log('[503] SW não registrado (esperado em modo standalone)'));
            });
        }
    }

    // Inicializa apenas o essencial para a página de erro
    injectMetadata();
    initServiceWorker();

    return {
        config: CONFIG
    };
})();
