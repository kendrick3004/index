/**
 * ARQUIVO: factory.js
 * DESCRIÇÃO: Centraliza a geração de metadados, SEO e configurações estruturais ("fábrica").
 * OBJETIVO: Manter os arquivos HTML limpos e garantir consistência em todo o projeto.
 * VERSÃO: 2.3.0 - PWA Removido (Apenas Design e Estrutura)
 */

const SiteFactory = (function() {
    'use strict';

    const CONFIG = {
        title: "Suite",
        description: "Dashboard pessoal com informações de clima, calendário litúrgico e links úteis.",
        author: "Kendrick Nicoleti",
        keywords: "Suite, Dashboard, Clima, Santo do Dia, Produtividade",
        themeColor: "#000000",
        favicon: "/database/assets/dev/favicon/Favicon.png"
    };

    function injectMetadata() {
        const head = document.head;
        const metaTags = [
            { name: "description", content: CONFIG.description },
            { name: "author", content: CONFIG.author },
            { name: "keywords", content: CONFIG.keywords },
            { name: "robots", content: "index, follow" },
            { name: "format-detection", content: "telephone=no" }
        ];

        metaTags.forEach(tag => {
            if (!document.querySelector(`meta[name="${tag.name}"]`)) {
                const meta = document.createElement('meta');
                meta.name = tag.name;
                meta.content = tag.content;
                head.appendChild(meta);
            }
        });

        const ogTags = [
            { property: "og:type", content: "website" },
            { property: "og:title", content: CONFIG.title },
            { property: "og:description", content: CONFIG.description },
            { property: "og:image", content: CONFIG.favicon },
            { property: "og:url", content: window.location.href }
        ];

        ogTags.forEach(tag => {
            if (!document.querySelector(`meta[property="${tag.property}"]`)) {
                const meta = document.createElement('meta');
                meta.setAttribute('property', tag.property);
                meta.content = tag.content;
                head.appendChild(meta);
            }
        });
    }

    function injectFonts() {
        if (!document.querySelector('link[href*="fonts-manager.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/src/styles/fonts-manager.css';
            document.head.appendChild(link);
        }
    }

    function injectColorSystem() {
        if (!document.querySelector('script[src*="colors.js"]')) {
            const script = document.createElement('script');
            script.src = '/src/js/main/colors.js';
            document.head.appendChild(script);
        }
    }

    // Inicializa apenas o essencial
    injectMetadata();
    injectFonts();
    injectColorSystem();

    return {
        config: CONFIG
    };
})();
