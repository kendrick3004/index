/**
 * ARQUIVO: suite.js
 * DESCRIÇÃO: Gerenciamento de temas, interações e persistência de estado offline.
 * FUNCIONALIDADES: Alternância de tema, Easter Egg e persistência de sessão para recarregamento offline.
 * VERSÃO: 2.3.0 - Resiliência Offline e Persistência de Sessão
 */

const SuiteModule = (function() {
    'use strict';

    // Chave para persistência de estado na sessão atual
    const SESSION_KEY = 'suite_session_state';
    const THEME_KEY = 'suite_theme'; // Persistência entre páginas
    
    /**
     * Estado inicial da aplicação.
     * isDarkMode: Inicia em true (Dark Mode é o padrão a partir da v2.4.0)
     * darkModeToggleCount: Contador para Easter Egg (desativado)
     * isLoginRevealed: Controla se o botão de login foi revelado
     */
    let state = {
        darkModeToggleCount: 0,
        isDarkMode: true,  // Dark Mode é o padrão agora
        isLoginRevealed: false
    };

    /**
     * Salva o estado atual no SessionStorage.
     * O SessionStorage persiste ao recarregar a página, mas é limpo ao fechar a aba/navegador.
     */
    function saveState() {
        try {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
        } catch (e) {
            console.error('[Suite] Erro ao salvar estado da sessão:', e);
        }
    }

    /**
     * Carrega o estado salvo do SessionStorage.
     */
    function loadState() {
        try {
            const saved = sessionStorage.getItem(SESSION_KEY);
            if (saved) {
                state = JSON.parse(saved);
                return true;
            }
        } catch (e) {
            console.error('[Suite] Erro ao carregar estado da sessão:', e);
        }
        return false;
    }

    /**
     * Carrega o tema salvo em localStorage para sincronizar entre páginas.
     * Se não houver tema salvo, define o Dark Mode como padrão (v2.4.0).
     */
    function loadThemeFromStorage() {
        try {
            const savedTheme = localStorage.getItem(THEME_KEY);
            if (savedTheme) {
                state.isDarkMode = savedTheme === 'dark';
            } else {
                // Se não houver tema salvo, o padrão é Dark Mode
                state.isDarkMode = true;
                localStorage.setItem(THEME_KEY, 'dark');
            }
            return true;
        } catch (e) {
            console.error('[Suite] Erro ao carregar tema do localStorage:', e);
        }
        return false;
    }

    /**
     * Inicializa o sistema de alternância de temas (Dark/Light).
     * Carrega o tema salvo do localStorage e aplica com transição suave.
     * Adiciona delay na mudança de tema para efeito visual melhorado.
     */
    function initThemeSwitch() {
        const switchBtn = document.querySelector('.switch');
        const toggle = document.querySelector('.switch-toggle');
        const body = document.body;

        if (!switchBtn || !toggle) return;

        // Carrega tema do localStorage (sincroniza entre páginas)
        loadThemeFromStorage();

        // Aplica o estado carregado ou o padrão (Dark Mode)
        if (state.isDarkMode) {
            body.classList.add('dark-mode');
            toggle.classList.add('switch-toggle-right');
        } else {
            body.classList.remove('dark-mode');
            toggle.classList.remove('switch-toggle-right');
        }

        // Se o login já estava revelado, reconstrói ele
        if (state.isLoginRevealed) {
            revealLoginButton(true); // true indica que é uma restauração silenciosa
        }

        switchBtn.addEventListener('click', () => {
            // Mudança de tema instantânea (sem delay)
            state.isDarkMode = body.classList.toggle('dark-mode');
            toggle.classList.toggle('switch-toggle-right');
            
            if (state.isDarkMode) {
                state.darkModeToggleCount++;
               checkEasterEgg();
            }
            
            saveState();
            // Salvar tema em localStorage para sincronizar entre páginas
            localStorage.setItem(THEME_KEY, state.isDarkMode ? 'dark' : 'light');
            console.log(`[Suite] Tema alterado para: ${state.isDarkMode ? 'Escuro' : 'Claro'}`);
        });
    }

    function checkEasterEgg() {
        // Easter Egg desativado temporariamente
        // if (state.darkModeToggleCount >= 2 && !state.isLoginRevealed) {
        //     revealLoginButton();
        // }
    }

    /**
     * Revela o botão de login e atualiza o estado.
     */
    function revealLoginButton(isRestoring = false) {
        const linksContainer = document.querySelector('.links');
        
    //    if (linksContainer && !document.querySelector('.link-item.login')) {
    //        const loginButton = document.createElement('div');
    //        loginButton.className = 'link-item login';
    //        loginButton.textContent = 'Login';
    //        
    //        loginButton.addEventListener('click', () => {
    //            window.location.href = 'pages';
    //        });
    //        
    //        linksContainer.appendChild(loginButton);
    //        state.isLoginRevealed = true;
    //        
    //        if (!isRestoring) {
    //            saveState();
    //            console.log('[Suite] Easter Egg ativado: Botão de Login revelado!');
    //        }
    //    }
    }

    return {
        init: function() {
            loadState(); // Tenta recuperar o estado antes de iniciar
            initThemeSwitch();
        }
    };
})();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', SuiteModule.init);
} else {
    SuiteModule.init();
}
