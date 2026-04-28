/**
 * ARQUIVO: firebase-sync.js
 * DESCRIÇÃO: Módulo de sincronização em tempo real com Firebase para orações
 * FUNCIONALIDADES: Sincronização automática via WebSockets
 * VERSÃO: 1.0.0
 */

const FirebaseSync = (function() {
    'use strict';

    let state = {
        userId: null,
        syncInProgress: false,
        unsubscribe: null
    };

    /**
     * Inicia a sincronização em tempo real para o usuário logado
     */
    function startSync() {
        if (state.unsubscribe) return;

        // Aguarda o Firebase carregar e o usuário estar autenticado
        const checkAuth = setInterval(() => {
            if (window.firebaseAuth && window.firebaseDb) {
                const user = firebaseAuth.currentUser;
                if (user) {
                    clearInterval(checkAuth);
                    state.userId = user.uid;
                    setupRealtimeListener();
                }
            }
        }, 500);
    }

    /**
     * Configura o ouvinte em tempo real do Firebase
     */
    function setupRealtimeListener() {
        if (!state.userId) return;

        const prayerRef = firebaseDb.ref('oracoes/' + state.userId);
        
        // Sempre que houver mudança no banco (mesmo em outros dispositivos), atualiza o local
        state.unsubscribe = prayerRef.on('value', (snapshot) => {
            const remoteData = snapshot.val();
            if (remoteData) {
                console.log('[FirebaseSync] Dados recebidos do servidor');
                
                // Merge com dados locais para garantir que nada se perca
                const localData = JSON.parse(localStorage.getItem('prayerData') || '{}');
                const mergedData = { ...localData, ...remoteData };
                
                // Salva no localStorage para que o resto do site funcione offline/cache
                localStorage.setItem('prayerData', JSON.stringify(mergedData));
                
                // Dispara o evento que as outras partes do site já escutam
                window.dispatchEvent(new CustomEvent('prayerDataUpdated', { detail: mergedData }));
            }
        });

        console.log('[FirebaseSync] Ouvinte em tempo real ativado para o usuário:', state.userId);
    }

    /**
     * Salva dados no Firebase (chamado quando o usuário altera algo localmente)
     */
    async function saveData(data) {
        if (!state.userId || !window.firebaseDb) return;

        try {
            const prayerRef = firebaseDb.ref('oracoes/' + state.userId);
            await prayerRef.set(data);
            console.log('[FirebaseSync] Dados salvos com sucesso no Firebase');
        } catch (error) {
            console.error('[FirebaseSync] Erro ao salvar dados:', error);
        }
    }

    /**
     * Para a sincronização
     */
    function stopSync() {
        if (state.unsubscribe && state.userId) {
            const prayerRef = firebaseDb.ref('oracoes/' + state.userId);
            prayerRef.off('value');
            state.unsubscribe = null;
            console.log('[FirebaseSync] Sincronização parada');
        }
    }

    function init() {
        console.log('[FirebaseSync] Inicializado');
        
        // Escuta mudanças locais para enviar ao Firebase
        window.addEventListener('prayerDataChanged', (e) => {
            if (e.detail) saveData(e.detail);
        });

        // Inicia sincronização se houver usuário
        startSync();
    }

    return {
        init, startSync, stopSync, saveData
    };
})();

// Inicialização
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', FirebaseSync.init);
} else {
    FirebaseSync.init();
}
