/**
 * ARQUIVO: config.js
 * DESCRIÇÃO: Arquivo de Configuração Global do Site.
 * FUNCIONALIDADES: Centraliza o carregamento de favicon, meta tags e estilos de temas.
 * VERSÃO: 2.2.0 - PWA Removido (Foco em Design e Estabilidade)
 */

(function() {
    'use strict';

    const basePath = '/';

    // ========================================
    // CONFIGURAÇÃO DE FAVICON (Ícones da Aba)
    // ========================================
    
    const iconDefault = document.createElement("link");
    iconDefault.rel = "icon";
    iconDefault.href = basePath + "database/assets/dev/favicon/Favicon.png";
    iconDefault.type = "image/png";
    document.head.appendChild(iconDefault);

    const icon32 = document.createElement("link");
    icon32.rel = "icon";
    icon32.type = "image/png";
    icon32.sizes = "32x32";
    icon32.href = basePath + "database/assets/dev/favicon/Favicon.png";
    document.head.appendChild(icon32);

    const icon16 = document.createElement("link");
    icon16.rel = "icon";
    icon16.type = "image/png";
    icon16.sizes = "16x16";
    icon16.href = basePath + "database/assets/dev/favicon/Favicon.png";
    document.head.appendChild(icon16);

    const appleIcon = document.createElement("link");
    appleIcon.rel = "apple-touch-icon";
    appleIcon.sizes = "180x180";
    appleIcon.href = basePath + "database/assets/dev/favicon/Favicon.png";
    document.head.appendChild(appleIcon);

    // ========================================
    // META TAGS PARA DISPOSITIVOS MÓVEIS (DESIGN)
    // ========================================
    
    const metaTheme = document.createElement("meta");
    metaTheme.name = "theme-color";
    metaTheme.content = "#1a1a1a";
    document.head.appendChild(metaTheme);

    // ========================================
    // CARREGAMENTO DINÂMICO DE CSS DE TEMAS
    // ========================================
    
    const modesCSS = document.createElement("link");
    modesCSS.rel = "stylesheet";
    modesCSS.href = basePath + "src/styles/modes.css";
    document.head.appendChild(modesCSS);

    console.log("✅ Configurações globais carregadas: favicon, meta tags e temas");
})();
