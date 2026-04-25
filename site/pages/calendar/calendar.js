/*
 * ARQUIVO: calendar.js
 * DESCRIÇÃO: Gerencia a visualização do calendário com barrinhas verticais para cada oração.
 * FUNCIONALIDADES: Renderização de Janeiro a Dezembro, barrinhas por oração, sincronização de tema.
 * VERSÃO: 3.2.0 - Design de Barrinhas Verticais
 */

// Nomes dos meses em português
const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// Nomes dos dias da semana
const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

// Nomes das orações (usando var para evitar erro de redeclaração se carregado com liturgy.js)
if (typeof prayerNames === 'undefined') {
    var prayerNames = {
        'laudes': 'Laudes',
        'hora-media': 'Hora Média',
        'vesperas': 'Vésperas',
        'completas': 'Completas'
    };
}

const prayerOrder = ['laudes', 'hora-media', 'vesperas', 'completas'];

// Inicializar ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
    renderCalendar();
    updateProgressSummary();
    setupEventListeners();
    monitorThemeChanges();

    // Listener para quando os dados de orações são atualizados (ex: via Google Drive Sync)
    window.addEventListener('prayerDataUpdated', function(event) {
        console.log('[Calendário] Dados atualizados recebidos, re-renderizando...');
        renderCalendar();
        updateProgressSummary();
    });
});

/**
 * Renderiza o calendário de Janeiro a Dezembro do ano atual
 */
function renderCalendar() {
    const container = document.getElementById('monthsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    const today = new Date();
    const currentYear = today.getFullYear();
    
    // Renderizar todos os 12 meses do ano atual
    for (let month = 0; month < 12; month++) {
        const date = new Date(currentYear, month, 1);
        const monthElement = createMonthElement(date);
        container.appendChild(monthElement);
    }
}

/**
 * Cria um elemento de mês expansível com barrinhas verticais
 * @param {Date} date - Data do mês
 * @returns {HTMLElement} Elemento do mês
 */
function createMonthElement(date) {
    const month = document.createElement('div');
    month.className = 'month collapsed'; // Começa colapsado
    
    /**
     * Cabeçalho do mês (clicável)
     * Exibe apenas o nome do mês (sem o ano) - v2.4.0
     */
    const header = document.createElement('div');
    header.className = 'month-header';
    header.innerHTML = `
        <span>${monthNames[date.getMonth()]}</span>
        <span class="month-toggle-icon">▼</span>
    `;
    
    // Adicionar evento de clique para expandir/colapsar
    header.addEventListener('click', function() {
        month.classList.toggle('collapsed');
    });
    
    month.appendChild(header);
    
    // Grid dos dias
    const daysGrid = document.createElement('div');
    daysGrid.className = 'days-grid';
    
    // Cabeçalho dos dias da semana
    dayNames.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'weekday-header';
        dayHeader.textContent = day;
        daysGrid.appendChild(dayHeader);
    });
    
    // Obter o primeiro dia do mês e quantos dias tem
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    
    /**
     * Adicionar dias vazios antes do primeiro dia
     * Exibe "Não realizadas" em vez de "vazia" - v2.4.0
     */
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'day empty';
        emptyDay.title = 'Não realizadas';
        daysGrid.appendChild(emptyDay);
    }
    
    // Adicionar dias do mês com barrinhas verticais
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'day';
        
        // Obter data no formato YYYY-MM-DD
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        // Número do dia
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        dayElement.appendChild(dayNumber);
        
        // Container das barrinhas
        const barsContainer = document.createElement('div');
        barsContainer.className = 'day-bars';
        
        // Criar 4 barrinhas (uma para cada oração)
        prayerOrder.forEach((prayer, index) => {
            const bar = document.createElement('div');
            bar.className = `day-bar ${prayer}`;
            
            // Verificar se a oração foi feita
            const isDone = isPrayerDone(dateStr, prayer);
            if (isDone) {
                bar.classList.add('active');
            }
            
            barsContainer.appendChild(bar);
        });
        
        dayElement.appendChild(barsContainer);
        
        // Adicionar tooltip
        const progress = getDayProgress(dateStr);
        dayElement.title = `${progress.completed}/${progress.total} orações`;
        
        daysGrid.appendChild(dayElement);
    }
    
    month.appendChild(daysGrid);
    return month;
}

/**
 * Verifica se uma oração foi feita em um dia específico
 * @param {string} dateStr - Data no formato YYYY-MM-DD
 * @param {string} prayer - Nome da oração
 * @returns {boolean} True se a oração foi feita
 */
function isPrayerDone(dateStr, prayer) {
    try {
        const prayerData = JSON.parse(localStorage.getItem('prayerData') || '{}');
        const dayData = prayerData[dateStr] || {};
        return dayData[prayer] === true;
    } catch (e) {
        console.error('[Calendário] Erro ao verificar oração:', e);
        return false;
    }
}

/**
 * Obtém o progresso de um dia específico
 * @param {string} dateStr - Data no formato YYYY-MM-DD
 * @returns {Object} Objeto com completed e total
 */
function getDayProgress(dateStr) {
    try {
        const prayerData = JSON.parse(localStorage.getItem('prayerData') || '{}');
        const dayData = prayerData[dateStr] || {};
        
        const total = 4; // Laudes, Hora Média, Vésperas, Completas
        const completed = Object.values(dayData).filter(v => v === true).length;
        
        return { completed, total };
    } catch (e) {
        console.error('[Calendário] Erro ao obter progresso do dia:', e);
        return { completed: 0, total: 4 };
    }
}

/**
 * Atualiza o resumo do progresso
 */
function updateProgressSummary() {
    let completedCount = 0;
    let partialCount = 0;
    let emptyCount = 0;
    
    const today = new Date();
    const currentYear = today.getFullYear();
    
    // Contar dias de todos os 12 meses do ano
    for (let month = 0; month < 12; month++) {
        const date = new Date(currentYear, month, 1);
        const daysInMonth = new Date(currentYear, month + 1, 0).getDate();
        
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const progress = getDayProgress(dateStr);
            
            if (progress.completed === 0) {
                emptyCount++;
            } else if (progress.completed === progress.total) {
                completedCount++;
            } else {
                partialCount++;
            }
        }
    }
    
    // Atualizar elementos
    const completedEl = document.getElementById('completedCount');
    const partialEl = document.getElementById('partialCount');
    const emptyEl = document.getElementById('emptyCount');
    
    if (completedEl) completedEl.textContent = completedCount;
    if (partialEl) partialEl.textContent = partialCount;
    if (emptyEl) emptyEl.textContent = emptyCount;
}

/**
 * Configura event listeners para os botões de ação
 */
function setupEventListeners() {
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const importFile = document.getElementById('importFile');
    
    if (exportBtn) exportBtn.addEventListener('click', handleExport);
    if (importBtn) importBtn.addEventListener('click', () => importFile.click());
    if (importFile) importFile.addEventListener('change', handleImport);
}

/**
 * Exibe modal personalizado de sucesso para exportação
 * @param {string} message - Mensagem a exibir
 */
function showSuccessModal(message) {
    const modal = document.createElement('div');
    modal.className = 'custom-modal success-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-icon">✓</div>
            <div class="modal-message">${message}</div>
            <button class="modal-button">OK</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    const button = modal.querySelector('.modal-button');
    button.addEventListener('click', () => modal.remove());
    
    // Auto-fechar após 3 segundos
    setTimeout(() => {
        if (modal.parentNode) modal.remove();
    }, 3000);
}

/**
 * Exporta os dados de orações para um arquivo JSON
 * Exibe card personalizado verde ao sucesso (v2.4.0)
 */
function handleExport() {
    try {
        const prayerData = localStorage.getItem('prayerData') || '{}';
        const blob = new Blob([prayerData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orações_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showSuccessModal('Dados exportados com sucesso!');
        console.log('[Calendário] Dados exportados com sucesso!');
    } catch (error) {
        showErrorModal('Erro ao exportar dados: ' + error.message);
        console.error('[Calendário] Erro ao exportar:', error);
    }
}

/**
 * Exibe modal personalizado de erro
 * @param {string} message - Mensagem de erro
 */
function showErrorModal(message) {
    const modal = document.createElement('div');
    modal.className = 'custom-modal error-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-icon">!</div>
            <div class="modal-message">${message}</div>
            <button class="modal-button">OK</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    const button = modal.querySelector('.modal-button');
    button.addEventListener('click', () => modal.remove());
}

/**
 * Importa dados de orações a partir de um arquivo JSON
 * Exibe card personalizado verde ao sucesso (v2.4.0)
 * @param {Event} event - Evento de mudança do input de arquivo
 */
    /**
     * Valida a estrutura dos dados de oração importados.
     * @param {Object} data - Objeto de dados a ser validado.
     * @returns {boolean} True se os dados são válidos, false caso contrário.
     */
    function validatePrayerData(data) {
        if (typeof data !== 'object' || data === null) {
            console.error('[Calendário] Erro de validação: Dados não são um objeto válido.');
            return false;
        }
        for (const dateKey in data) {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
                console.error(`[Calendário] Erro de validação: Chave de data inválida: ${dateKey}`);
                return false;
            }
            const dayData = data[dateKey];
            if (typeof dayData !== 'object' || dayData === null) {
                console.error(`[Calendário] Erro de validação: Dados do dia não são um objeto válido para ${dateKey}.`);
                return false;
            }
            for (const prayerKey in dayData) {
                if (!prayerOrder.includes(prayerKey)) {
                    console.error(`[Calendário] Erro de validação: Chave de oração inválida: ${prayerKey} para ${dateKey}.`);
                    return false;
                }
                if (typeof dayData[prayerKey] !== 'boolean') {
                    console.error(`[Calendário] Erro de validação: Valor da oração não é booleano para ${prayerKey} em ${dateKey}.`);
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Sanitiza strings para prevenir XSS. (Placeholder para DOMPurify ou similar)
     * @param {string} html - String a ser sanitizada.
     * @returns {string} String sanitizada.
     */
    function sanitizeHTML(html) {
        // Em um ambiente de produção, usar uma biblioteca robusta como DOMPurify.
        // Exemplo: return DOMPurify.sanitize(html);
        // Por enquanto, uma sanitização básica para evitar injeção de scripts simples.
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(html));
        return div.innerHTML;
    }

function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const jsonData = e.target.result;
            let parsedData;
            try {
                parsedData = JSON.parse(jsonData);
            } catch (parseError) {
                showErrorModal('Erro ao analisar o arquivo JSON: ' + parseError.message);
                console.error('[Calendário] Erro ao analisar JSON:', parseError);
                return;
            }

            if (!validatePrayerData(parsedData)) {
                showErrorModal('Erro de validação: O arquivo JSON não está no formato esperado.');
                return;
            }

            // Opcional: Sanitizar quaisquer strings dentro dos dados se houver risco de XSS
            // Para este caso, como são apenas booleanos e datas, a validação é suficiente.
            
            localStorage.setItem('prayerData', JSON.stringify(parsedData));
            renderCalendar();
            updateProgressSummary();
            showSuccessModal('Dados importados com sucesso!');
            console.log('[Calendário] Dados importados com sucesso!');
        } catch (error) {
            showErrorModal('Erro ao importar dados: ' + error.message);
            console.error('[Calendário] Erro ao importar:', error);
        }
    };
    reader.readAsText(file);
}

/**
 * Carrega o tema salvo em localStorage e aplica à página
 */
function loadTheme() {
    const savedTheme = localStorage.getItem('suite_theme') || 'dark';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    
    console.log(`[Calendário] Tema carregado: ${savedTheme}`);
}

/**
 * Monitora mudanças no tema (se o usuário voltar para a home e mudar o tema)
 */
function monitorThemeChanges() {
    // Verificar a cada 500ms se o tema foi alterado
    setInterval(function() {
        const savedTheme = localStorage.getItem('suite_theme') || 'dark';
        const isDarkMode = document.body.classList.contains('dark-mode');
        const shouldBeDark = savedTheme === 'dark';
        
        if (isDarkMode !== shouldBeDark) {
            loadTheme();
        }
    }, 500);
}
