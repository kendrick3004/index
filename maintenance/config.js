/**
 * ARQUIVO: 503/config.js
 * DESCRIÇÃO: Configurações básicas para a página de erro 503.
 * VERSÃO: 1.0.0 - Standalone
 */

(function() {
    'use strict';

    // Adiciona o favicon dinamicamente se não estiver no HTML
    if (!document.querySelector('link[rel="icon"]')) {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/png';
        link.href = 'favicon.png';
        document.head.appendChild(link);
    }

    // Define a cor do tema para navegadores mobile
    if (!document.querySelector('meta[name="theme-color"]')) {
        const meta = document.createElement('meta');
        meta.name = 'theme-color';
        meta.content = '#1a1a1a';
        document.head.appendChild(meta);
    }

    console.log('[503] Configurações carregadas.');
})();
