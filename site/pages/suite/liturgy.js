/*
 * ARQUIVO: liturgy.js
 * DESCRIÇÃO: Gerencia o menu da Liturgia das Horas e a sincronização com o calendário.
 * FUNCIONALIDADES: Marcação de orações, sincronização com LocalStorage, zeramento diário.
 * VERSÃO: 2.1.0 - Sincronização Corrigida com prayerData Unificado
 */

// Nomes das orações em português (usando var para evitar erro de redeclaração se carregado com calendar.js)
if (typeof prayerNames === 'undefined') {
    var prayerNames = {
        'laudes': 'Laudes',
        'hora-media': 'Hora Média',
        'vesperas': 'Vésperas',
        'completas': 'Completas'
    };
}

// Inicializar o menu
document.addEventListener('DOMContentLoaded', function() {
    const prayerItems = document.querySelectorAll('.prayer-item');

    // Carregar status das orações do LocalStorage
    loadPrayerStatus();

    // Adicionar event listeners aos botões de oração
    prayerItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const prayer = this.getAttribute('data-prayer');
            togglePrayer(prayer, this);
        });
    });

    // Monitorar mudança de dia
    monitorDayChange();

    // Listener para quando os dados de orações são atualizados (ex: via Google Drive Sync)
    window.addEventListener('prayerDataUpdated', function(event) {
        console.log('[Liturgia] Dados atualizados recebidos, recarregando status...');
        loadPrayerStatus();
    });
});

/**
 * Obtém a data de hoje no formato YYYY-MM-DD
 * @returns {string} Data formatada
 */
function getTodayDateStr() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

/**
 * Alterna o status de uma oração (feita/não feita)
 * @param {string} prayer - Identificador da oração
 * @param {HTMLElement} element - Elemento do botão
 */
function togglePrayer(prayer, element) {
    const todayDate = getTodayDateStr();
    
    try {
        // Obter dados existentes do prayerData unificado
        const prayerData = JSON.parse(localStorage.getItem('prayerData') || '{}');
        
        // Garantir que existe um objeto para hoje
        if (!prayerData[todayDate]) {
            prayerData[todayDate] = {};
        }
        
        // Alternar status
        prayerData[todayDate][prayer] = !prayerData[todayDate][prayer];
        
        // Salvar de volta no LocalStorage
        localStorage.setItem('prayerData', JSON.stringify(prayerData));

        // Disparar evento para o FirebaseSync (novo)
        window.dispatchEvent(new CustomEvent('prayerDataChanged', { detail: prayerData }));
        
        // Atualizar visual do botão
        updatePrayerUI(prayer, prayerData[todayDate][prayer], element);
        
        console.log(`[Liturgia] ${prayerNames[prayer]} marcada como ${prayerData[todayDate][prayer] ? 'feita' : 'não feita'} para ${todayDate}`);
    } catch (e) {
        console.error('[Liturgia] Erro ao marcar oração:', e);
    }
}

/**
 * Atualiza a interface visual de uma oração
 * @param {string} prayer - Identificador da oração
 * @param {boolean} completed - Se a oração foi feita
 * @param {HTMLElement} element - Elemento do botão
 */
/**
 * Sanitiza o texto para evitar ataques XSS.
 */
function sanitize(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function updatePrayerUI(prayer, completed, element) {
    const safeName = sanitize(prayerNames[prayer]);
    if (completed) {
        element.classList.add('completed');
        element.innerHTML = `<span class="prayer-name">${safeName}</span> ✓`;
    } else {
        element.classList.remove('completed');
        element.innerHTML = `<span class="prayer-name">${safeName}</span>`;
    }
}

/**
 * Carrega o status das orações do LocalStorage e atualiza a UI
 */
function loadPrayerStatus() {
    const todayDate = getTodayDateStr();
    
    try {
        const prayerData = JSON.parse(localStorage.getItem('prayerData') || '{}');
        const todayData = prayerData[todayDate] || {};
        
        const prayerItems = document.querySelectorAll('.prayer-item');
        
        prayerItems.forEach(item => {
            const prayer = item.getAttribute('data-prayer');
            const isDone = todayData[prayer] === true;
            updatePrayerUI(prayer, isDone, item);
        });
        
        console.log(`[Liturgia] Orações de hoje (${todayDate}) carregadas:`, todayData);
    } catch (e) {
        console.error('[Liturgia] Erro ao carregar orações de hoje:', e);
    }
}

/**
 * Monitora mudanças de dia e recarrega as orações
 */
function monitorDayChange() {
    let lastDate = getTodayDateStr();
    
    setInterval(function() {
        const currentDate = getTodayDateStr();
        
        if (currentDate !== lastDate) {
            console.log(`[Liturgia] Dia mudou de ${lastDate} para ${currentDate}. Recarregando orações...`);
            lastDate = currentDate;
            loadPrayerStatus();
        }
    }, 60000); // Verificar a cada minuto
}

/**
 * Obtém o status de todas as orações de um dia específico
 * @param {string} date - Data no formato YYYY-MM-DD
 * @returns {Object} Objeto com o status de cada oração
 */
function getDayPrayers(date) {
    try {
        const prayerData = JSON.parse(localStorage.getItem('prayerData') || '{}');
        return prayerData[date] || {};
    } catch (e) {
        console.error('[Liturgia] Erro ao obter orações do dia:', e);
        return {};
    }
}

/**
 * Obtém o progresso de um dia específico
 * @param {string} date - Data no formato YYYY-MM-DD
 * @returns {Object} Objeto com completed e total
 */
function getDayProgress(date) {
    try {
        const prayerData = JSON.parse(localStorage.getItem('prayerData') || '{}');
        const dayData = prayerData[date] || {};
        
        const completed = Object.values(dayData).filter(v => v === true).length;
        const total = 4;
        
        return { completed, total, date };
    } catch (e) {
        console.error('[Liturgia] Erro ao obter progresso do dia:', e);
        return { completed: 0, total: 4, date };
    }
}

/**
 * Exporta todos os dados de orações para backup
 * @returns {string} JSON com todos os dados
 */
function exportPrayerData() {
    try {
        const prayerData = localStorage.getItem('prayerData') || '{}';
        return prayerData;
    } catch (e) {
        console.error('[Liturgia] Erro ao exportar dados:', e);
        return '{}';
    }
}

/**
 * Importa dados de orações a partir de um backup
 * @param {string} jsonData - JSON com os dados
 */
function importPrayerData(jsonData) {
    try {
        const data = JSON.parse(jsonData);
        localStorage.setItem('prayerData', JSON.stringify(data));
        console.log('[Liturgia] Dados importados com sucesso!');
        loadPrayerStatus();
    } catch (error) {
        console.error('[Liturgia] Erro ao importar dados:', error);
    }
}
