/**
 * ARQUIVO: rate-limiter.js
 * DESCRIÇÃO: Sistema de *deterrente* de ataques de negação de serviço (DDoS) no front-end. **ATENÇÃO: Esta é uma medida de segurança apenas no lado do cliente e pode ser facilmente contornada. Um rate limiter robusto DEVE ser implementado no lado do servidor.**
 * FUNCIONALIDADES: Rate limiting para requisições suspeitas com bloqueio persistente.
 * VERSÃO: 2.1.0 - 10 cliques em 2 segundos com bloqueio persistente
 */

const RateLimiter = (function() {
    'use strict';

    // Configurações
    const CONFIG = {
        MAX_REQUESTS: 10,          // Máximo de cliques/recarregamentos permitidos
        TIME_WINDOW: 5000,         // Janela de tempo em milissegundos (5 segundos)
        BLOCK_DURATION: 30000,     // Duração do bloqueio aumentada para 30 segundos
        STORAGE_KEY: 'rate_limiter_data'
    };

    // Estado local
    let state = {
        requestTimestamps: [],
        isBlocked: false,
        blockUntil: null
    };

    /**
     * Carrega o estado do rate limiter do localStorage
     */
    function loadState() {
        try {
            const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                state.requestTimestamps = data.requestTimestamps || [];
                state.isBlocked = data.isBlocked || false;
                state.blockUntil = data.blockUntil || null;
                
                // Se o bloqueio expirou, desbloqueia
                if (state.isBlocked && state.blockUntil && Date.now() > state.blockUntil) {
                    state.isBlocked = false;
                    state.blockUntil = null;
                    saveState();
                } else if (state.isBlocked && state.blockUntil && Date.now() < state.blockUntil) {
                    // Bloqueio ainda ativo - redireciona para página de bloqueio
                    redirectToBlockPage();
                }
            }
        } catch (error) {
            console.error('[RateLimiter] Erro ao carregar estado:', error);
        }
    }

    /**
     * Salva o estado do rate limiter no localStorage
     */
    function saveState() {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
            console.error('[RateLimiter] Erro ao salvar estado:', error);
        }
    }

    /**
     * Limpa as requisições antigas que saíram da janela de tempo
     */
    function cleanOldRequests() {
        const now = Date.now();
        state.requestTimestamps = state.requestTimestamps.filter(timestamp => {
            return (now - timestamp) < CONFIG.TIME_WINDOW;
        });
    }

    /**
     * Verifica se a requisição é permitida
     * @param {string} type - Tipo de requisição ('click', 'fetch', 'submit')
     * @returns {boolean} True se a requisição é permitida, false se deve ser bloqueada
     */
    function isRequestAllowed(type = 'click') {
        loadState();

        // Se está bloqueado, verifica se o bloqueio ainda está ativo
        if (state.isBlocked) {
            if (Date.now() < state.blockUntil) {
                console.warn('[RateLimiter] Acesso bloqueado. Bloqueio ativo até:', new Date(state.blockUntil).toLocaleTimeString());
                redirectToBlockPage();
                return false;
            } else {
                // Bloqueio expirou, desbloqueia
                state.isBlocked = false;
                state.blockUntil = null;
                saveState();
            }
        }

        // Limpa requisições antigas
        cleanOldRequests();

        // Verifica se excedeu o limite
        if (state.requestTimestamps.length >= CONFIG.MAX_REQUESTS) {
            console.warn('[RateLimiter] Limite de requisições excedido! Bloqueando por', CONFIG.BLOCK_DURATION / 1000, 'segundos');
            
            // Bloqueia o acesso
            state.isBlocked = true;
            state.blockUntil = Date.now() + CONFIG.BLOCK_DURATION;
            state.requestTimestamps = [];
            saveState();

            // Redireciona para a página de bloqueio
            redirectToBlockPage();
            return false;
        }

        // Adiciona o timestamp da requisição atual
        state.requestTimestamps.push(Date.now());
        saveState();

        console.log('[RateLimiter] Requisição permitida (' + type + '). Total na janela:', state.requestTimestamps.length);
        return true;
    }

    /**
     * Redireciona para a página de bloqueio
     * Funciona em todo o domínio, independente da profundidade da URL
     */
    function redirectToBlockPage() {
        // Se já está na página 429, não redireciona novamente
        const pathname = window.location.pathname;
        if (pathname.endsWith('/429.html') || pathname === '/429') {
            return;
        }
        
        // Redireciona para a raiz do domínio + 429.html
        // Isso garante que funcione de qualquer subdiretório
        const protocol = window.location.protocol; // http: ou https:
        const host = window.location.host;         // dominio.com ou dominio.com:porta
        const blockPageUrl = protocol + '//' + host + '/429.html';
        
        window.location.href = blockPageUrl;
    }

    /**
     * Reseta o contador de requisições (útil para testes)
     */
    function reset() {
        state.requestTimestamps = [];
        state.isBlocked = false;
        state.blockUntil = null;
        localStorage.removeItem(CONFIG.STORAGE_KEY);
        console.log('[RateLimiter] Contador resetado');
    }

    /**
     * Retorna informações de debug
     */
    function getStatus() {
        loadState();
        cleanOldRequests();
        return {
            isBlocked: state.isBlocked,
            blockUntil: state.blockUntil ? new Date(state.blockUntil).toLocaleTimeString() : null,
            requestsInWindow: state.requestTimestamps.length,
            maxRequests: CONFIG.MAX_REQUESTS,
            timeWindow: CONFIG.TIME_WINDOW / 1000 + 's',
            blockDuration: CONFIG.BLOCK_DURATION / 1000 + 's'
        };
    }

    /**
     * Inicializa o sistema de rate limiting
     */
    function init() {
        console.log('[RateLimiter] Inicializado com limite de', CONFIG.MAX_REQUESTS, 'requisições em', CONFIG.TIME_WINDOW / 1000, 'segundos');
        
        // Verifica estado de bloqueio ao carregar a página
        loadState();
        
        // Monitora cliques em links
        document.addEventListener('click', function(e) {
            if (e.target.tagName === 'A' && e.target.href) {
                if (!isRequestAllowed('click')) {
                    e.preventDefault();
                }
            }
        });

        // Monitora submissões de formulário
        document.addEventListener('submit', function(e) {
            if (!isRequestAllowed('submit')) {
                e.preventDefault();
            }
        });

        // Monitora requisições fetch
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            if (!isRequestAllowed('fetch')) {
                return Promise.reject(new Error('Rate limit exceeded'));
            }
            return originalFetch.apply(this, args);
        };
    }

    // Expõe métodos públicos
    return {
        init,
        isRequestAllowed,
        reset,
        getStatus
    };
})();

// Inicialização automática
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', RateLimiter.init);
} else {
    RateLimiter.init();
}
