/**
 * ARQUIVO: config.js
 * DESCRIÇÃO: Arquivo de Configuração Global do Site.
 * FUNCIONALIDADES: Centraliza o carregamento de favicon, meta tags e estilos de temas.
 * VERSÃO: 2.1.0 - Caminhos Absolutos para Estabilidade
 */

(function() {
    'use strict';

    // Usar caminhos absolutos (começando com /) garante que os assets carreguem 
    // corretamente independentemente da profundidade da página na URL.
    const basePath = '/';

    // ========================================
    // CONFIGURAÇÃO DE FAVICON (Ícones da Aba)
    // ========================================
    
    const iconDefault = document.createElement("link");
    iconDefault.rel = "icon";
    iconDefault.href = basePath + "database/assets/dev/dev/favicon/Favicon.png";
    iconDefault.type = "image/png";
    document.head.appendChild(iconDefault);

    const icon32 = document.createElement("link");
    icon32.rel = "icon";
    icon32.type = "image/png";
    icon32.sizes = "32x32";
    icon32.href = basePath + "database/assets/dev/dev/favicon/Favicon.png";
    document.head.appendChild(icon32);

    const icon16 = document.createElement("link");
    icon16.rel = "icon";
    icon16.type = "image/png";
    icon16.sizes = "16x16";
    icon16.href = basePath + "database/assets/dev/dev/favicon/Favicon.png";
    document.head.appendChild(icon16);

    const appleIcon = document.createElement("link");
    appleIcon.rel = "apple-touch-icon";
    appleIcon.sizes = "180x180";
    appleIcon.href = basePath + "database/assets/dev/dev/favicon/Favicon.png";
    document.head.appendChild(appleIcon);

    const manifest = document.createElement("link");
    manifest.rel = "manifest";
    manifest.href = basePath + "manifest.json";
    document.head.appendChild(manifest);

    // ========================================
    // META TAGS PARA SAFARI E DISPOSITIVOS MÓVEIS
    // ========================================
    
    const metaCapable = document.createElement("meta");
    metaCapable.name = "mobile-web-app-capable";
    metaCapable.content = "yes";
    document.head.appendChild(metaCapable);

    const metaAppleCapable = document.createElement("meta");
    metaAppleCapable.name = "apple-mobile-web-app-capable";
    metaAppleCapable.content = "yes";
    document.head.appendChild(metaAppleCapable);

    const metaStatusBar = document.createElement("meta");
    metaStatusBar.name = "apple-mobile-web-app-status-bar-style";
    metaStatusBar.content = "black";
    document.head.appendChild(metaStatusBar);

    const metaTitle = document.createElement("meta");
    metaTitle.name = "apple-mobile-web-app-title";
    metaTitle.content = "Suite";
    document.head.appendChild(metaTitle);

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
