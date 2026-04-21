/**
 * ARQUIVO: update.js
 * LOCAL: /src/app/
 * DESCRIÇÃO: Sistema de atualização automática para o PWA com limpeza seletiva de dados.
 * FUNCIONALIDADES: Detecta novas versões, recarrega automaticamente e limpa dados de interface sem deslogar.
 * VERSÃO: 3.2.0
 */

const UpdateSystem = (function() {
    'use strict';

    // Versão atual do código em execução
    const CURRENT_VERSION = '3.3.0'; 
    const VERSION_CHECK_URL = '/src/app/version.json'; 
    const STORAGE_KEY = 'suite_last_seen_version';

    // Dados que DEVEM ser preservados em qualquer atualização
    const PRESERVE_KEYS = [
        'auth_user',              // Dados do usuário autenticado
        'auth_timestamp',         // Timestamp da autenticação
        'firebase_token',         // Token Firebase (se existir)
        'suite_last_seen_version' // Versão vista pelo usuário
    ];

    function isStandalone() {
        return (window.matchMedia('(display-mode: standalone)').matches) || 
               (window.navigator.standalone) || 
               document.referrer.includes('android-app://');
    }

    function init() {
        // Verifica Service Worker para atualizações de assets
        setupServiceWorkerUpdate();
        
        // Verifica version.json para atualizações de conteúdo/lógica
        if (isStandalone()) {
            setTimeout(checkVersion, 2000);
        }
    }

    /**
     * Monitora o Service Worker para detectar quando uma nova versão foi instalada.
     */
    function setupServiceWorkerUpdate() {
        if (!('serviceWorker' in navigator)) return;

        navigator.serviceWorker.ready.then(registration => {
            // Verifica se já existe um SW esperando (waiting)
            if (registration.waiting) {
                updateReady(registration.waiting);
            }

            // Ouve por novos SWs que chegam ao estado 'waiting'
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed') {
                        if (navigator.serviceWorker.controller) {
                            updateReady(newWorker);
                        }
                    }
                });
            });
        });

        // Recarrega a página quando o novo SW assumir o controle
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (refreshing) return;
            refreshing = true;
            
            // Limpa dados de interface antes de recarregar
            clearInterfaceData();
            
            // Aguarda um pouco para garantir que a limpeza foi concluída
            setTimeout(() => {
                window.location.reload();
            }, 100);
        });

        // Ouve mensagens do Service Worker
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'CACHE_UPDATED') {
                console.log('[App] Cache atualizado! Preparando para recarregar...');
            }
        });
    }

    /**
     * Chamado quando uma atualização do Service Worker está pronta.
     */
    function updateReady(worker) {
        console.log('[App] Nova versão detectada! Atualizando...');
        // Envia mensagem para o SW fazer skipWaiting
        worker.postMessage('SKIP_WAITING');
    }

    /**
     * Limpa dados de interface e estado, preservando a sessão de login.
     */
    function clearInterfaceData() {
        console.log('[App] Limpando dados de interface...');
        
        // Preserva os dados de autenticação
        const preservedData = {};
        PRESERVE_KEYS.forEach(key => {
            const value = localStorage.getItem(key);
            if (value) {
                preservedData[key] = value;
            }
        });

        // Limpa TODO o localStorage
        localStorage.clear();

        // Restaura apenas os dados preservados
        Object.entries(preservedData).forEach(([key, value]) => {
            localStorage.setItem(key, value);
        });

        // Limpa IndexedDB (se usado para cache de dados)
        if (window.indexedDB) {
            try {
                const dbs = ['suite_db', 'firebaseLocalStorageDb'];
                dbs.forEach(dbName => {
                    const req = window.indexedDB.deleteDatabase(dbName);
                    req.onsuccess = () => console.log(`[App] ${dbName} limpo`);
                    req.onerror = () => console.warn(`[App] Erro ao limpar ${dbName}`);
                });
            } catch (e) {
                console.warn('[App] Erro ao limpar IndexedDB:', e);
            }
        }

        // Limpa sessionStorage completamente (dados temporários)
        sessionStorage.clear();

        console.log('[App] Dados de interface limpos. Login preservado.');
    }

    /**
     * Busca o arquivo de versão no servidor.
     */
    async function checkVersion() {
        try {
            const response = await fetch(`${VERSION_CHECK_URL}?t=${Date.now()}`);
            if (!response.ok) return;

            const data = await response.json();

            // Se houver uma versão nova no JSON, força a atualização do Service Worker
            if (isNewerVersion(data.version, CURRENT_VERSION)) {
                if ('serviceWorker' in navigator) {
                    const reg = await navigator.serviceWorker.getRegistration();
                    if (reg) {
                        reg.update(); // Força o navegador a checar o sw.js no servidor
                    }
                }
                // O modal de novidades foi removido a pedido do usuário para uma atualização 100% silenciosa.
                localStorage.setItem(STORAGE_KEY, data.version);
            }
        } catch (error) {
            console.error('[App] Erro na verificação de atualizações:', error);
        }
    }

    function isNewerVersion(newVer, currentVer) {
        if (!newVer) return false;
        const v1 = newVer.split('.').map(Number);
        const v2 = currentVer.split('.').map(Number);
        for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
            const num1 = v1[i] || 0;
            const num2 = v2[i] || 0;
            if (num1 > num2) return true;
            if (num1 < num2) return false;
        }
        return false;
    }

    return { init: init };
})();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', UpdateSystem.init);
} else {
    UpdateSystem.init();
}
