/**
 * ARQUIVO: splash.js (VERSÃO 5.0 - DESIGN ORIGINAL COM EFEITOS LUMINOSOS)
 * LOCAL: /src/app/
 * DESCRIÇÃO: Gerencia a exibição e o fechamento da Splash Screen customizada.
 *            Aparece APENAS no PWA instalado (standalone).
 *            Design: Sagrado Contemporâneo com efeitos de brilho e aura.
 * VERSÃO: 5.0.0 - Design original com raios, glow e animações sofisticadas
 */

const SplashManager = (function() {
    'use strict';

    /**
     * Detecta se o app está rodando como PWA instalado (standalone).
     * Realiza múltiplas verificações para garantir que é realmente um PWA.
     */
    function isStandalone() {
        // Verificação 1: display-mode: browser (navegador web comum) - NEGA PWA
        if (window.matchMedia && window.matchMedia('(display-mode: browser)').matches) {
            console.log('[Splash] ❌ Modo: Navegador web (display-mode: browser) - splash oculta');
            return false;
        }

        // Verificação 2: display-mode: standalone (padrão W3C - Android Chrome) - CONFIRMA PWA
        if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
            console.log('[Splash] ✅ PWA detectado: display-mode standalone (Android/Chrome)');
            return true;
        }

        // Verificação 3: navigator.standalone (iOS Safari) - CONFIRMA PWA
        if (window.navigator.standalone === true) {
            console.log('[Splash] ✅ PWA detectado: navigator.standalone (iOS Safari)');
            return true;
        }

        // Verificação 4: referrer de app Android - CONFIRMA PWA
        if (document.referrer && document.referrer.includes('android-app://')) {
            console.log('[Splash] ✅ PWA detectado: android-app referrer');
            return true;
        }

        // Verificação 5: Verifica se há Service Worker ativo (indicador de PWA)
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            console.log('[Splash] ✅ PWA detectado: Service Worker ativo');
            return true;
        }

        console.log('[Splash] ❌ Modo: Navegador web comum - splash permanecerá oculta');
        return false;
    }

    /**
     * Detecta o tema do sistema operacional (claro ou escuro).
     * Prioridade: 1. Classe .dark-mode no body 2. prefers-color-scheme do sistema
     */
    function detectTheme() {
        const body = document.body;
        
        // Se a classe .dark-mode já existe, usa o tema escuro
        if (body.classList.contains('dark-mode')) {
            console.log('[Splash] 🌙 Tema detectado: Escuro (classe .dark-mode)');
            return 'dark';
        }

        // Verifica a preferência do sistema operacional
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            console.log('[Splash] 🌙 Tema detectado: Escuro (prefers-color-scheme)');
            return 'dark';
        }

        console.log('[Splash] ☀️ Tema detectado: Claro');
        return 'light';
    }

    /**
     * Aplica as cores do tema ao Splash Container com força máxima
     */
    function applyThemeColors(element, theme) {
        if (!element) return;

        if (theme === 'dark') {
            // Modo Escuro: Fundo preto/cinza escuro
            element.style.setProperty('background', 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)', 'important');
            console.log('[Splash] 🎨 Cores do tema escuro aplicadas');
        } else {
            // Modo Claro: Fundo branco/cinza claro
            element.style.setProperty('background', 'linear-gradient(135deg, #ffffff 0%, #f8f8f8 100%)', 'important');
            console.log('[Splash] 🎨 Cores do tema claro aplicadas');
        }
    }

    /**
     * Força o uso do Favicon_R.png na imagem do logo
     */
    function forceFaviconR() {
        const logoImg = document.querySelector('.splash-logo');
        if (logoImg) {
            logoImg.src = 'database/assets/dev/dev/favicon/Favicon_R.png';
            logoImg.alt = 'Suite Logo';
            logoImg.style.setProperty('width', '80px', 'important');
            logoImg.style.setProperty('height', '80px', 'important');
            console.log('[Splash] 🎯 Favicon_R.png forçado no logo');
        }
    }

    /**
     * Cria os raios de luz ao redor do logo
     */
    function createRays() {
        const raysContainer = document.querySelector('.splash-rays');
        if (!raysContainer) return;

        // Limpa raios anteriores
        raysContainer.innerHTML = '';

        // Cria 12 raios distribuídos em círculo
        for (let i = 0; i < 12; i++) {
            const ray = document.createElement('div');
            ray.className = 'splash-ray';
            ray.style.transform = `rotate(${i * 30}deg)`;
            raysContainer.appendChild(ray);
        }

        console.log('[Splash] ✨ Raios de luz criados (12 raios)');
    }

    /**
     * Exibe a splash screen com força máxima (apenas para PWA)
     * Verifica novamente se é realmente PWA antes de exibir
     */
    function showSplash(element) {
        if (!element) return;
        
        // Verifica novamente se é PWA antes de exibir
        if (!isStandalone()) {
            console.log('[Splash] 🚫 Bloqueado: Não é PWA - splash permanece oculta');
            element.classList.remove('active');
            return;
        }
        
        // Adiciona a classe .active para exibir via CSS
        element.classList.add('active');
        
        console.log('[Splash] 👁️ Splash exibida (PWA detectado)');
    }

    /**
     * Oculta a splash screen com fade-out elegante (0.6s)
     */
    function hideSplashWithFade(element) {
        if (!element) return;
        
        element.classList.add('fade-out');
        setTimeout(() => {
            element.classList.remove('active', 'fade-out');
        }, 600);
        
        console.log('[Splash] 👋 Fade-out iniciado - splash oculta');
    }

    /**
     * Monitora mudanças de tema em tempo real
     */
    function watchThemeChanges(element) {
        if (!window.matchMedia) return;

        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        // Listener para mudanças de tema do sistema
        if (darkModeQuery.addListener) {
            darkModeQuery.addListener((e) => {
                const newTheme = e.matches ? 'dark' : 'light';
                console.log('[Splash] 🔄 Tema alterado para:', newTheme);
                applyThemeColors(element, newTheme);
            });
        }

        // Listener para mudanças de classe .dark-mode
        const observer = new MutationObserver(() => {
            const theme = detectTheme();
            applyThemeColors(element, theme);
        });

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class']
        });

        console.log('[Splash] 👁️ Monitoramento de tema ativado');
    }

    /**
     * Inicializa o gerenciador de splash screen
     */
    function init() {
        const splash = document.getElementById('custom-splash');
        if (!splash) {
            console.log('[Splash] ⚠️ Elemento #custom-splash não encontrado');
            return;
        }

        console.log('[Splash] 🚀 Inicializando SplashManager v5.0.0...');

        // Força o uso do Favicon_R.png
        forceFaviconR();

        // Cria os raios de luz
        createRays();

        // Detecta o modo de execução
        const standalone = isStandalone();

        // Se é navegador web comum: mantém oculta
        if (!standalone) {
            console.log('[Splash] 🔒 Navegador web - Splash permanece oculta');
            return;
        }

        // Se é PWA: exibe a splash
        console.log('[Splash] ⏳ PWA detectado - exibindo splash elegante...');
        
        // Detecta o tema atual
        const theme = detectTheme();
        
        // Aplica as cores do tema
        applyThemeColors(splash, theme);
        
        // Monitora mudanças de tema em tempo real
        watchThemeChanges(splash);
        
        // Exibe a splash screen
        showSplash(splash);

        // Listener para quando a página terminar de carregar
        if (document.readyState === 'complete') {
            // Página já carregou
            setTimeout(() => {
                hideSplashWithFade(splash);
            }, 1500);
        } else {
            // Aguarda o carregamento
            window.addEventListener('load', () => {
                setTimeout(() => {
                    hideSplashWithFade(splash);
                }, 1500);
            });
        }

        // Timeout de segurança: se o load demorar muito, oculta em 7 segundos
        setTimeout(() => {
            if (splash.classList.contains('active')) {
                console.log('[Splash] ⏱️ Timeout atingido, ocultando splash...');
                hideSplashWithFade(splash);
            }
        }, 7000);
    }

    return { init: init };
})();

// Inicializa o gerenciador
console.log('[Splash] 🔥 Carregando SplashManager v5.0.0...');

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', SplashManager.init);
} else {
    SplashManager.init();
}

// Também tenta inicializar no load para garantir
window.addEventListener('load', () => {
    const splash = document.getElementById('custom-splash');
    if (splash && !splash.classList.contains('active')) {
        console.log('[Splash] 🔥 Garantindo que o Splash está visível (se PWA)...');
        SplashManager.init();
    }
});
