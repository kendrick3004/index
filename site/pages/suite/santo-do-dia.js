/**
 * ARQUIVO: santo-do-dia.js
 * DESCRIÇÃO: Módulo robusto para exibição do calendário litúrgico com suporte a múltiplos santos.
 * FUNCIONALIDADES: Busca dados diários de um JSON, calcula a data litúrgica e atualiza a interface.
 * VERSÃO: 2.0.0 - Auditoria Total e Comentários Detalhados
 */

/**
 * Módulo SaintModule encapsulado para gerenciar as informações do Santo do Dia.
 */
const SaintModule = (function() {
    'use strict';

    // Armazena a última data processada para evitar requisições desnecessárias no intervalo de atualização
    let lastProcessedDate = "";

    /**
     * Sanitiza strings e converte separadores " / " em quebras de linha para múltiplos santos.
     * @param {string} name O nome bruto vindo do banco de dados (JSON).
     * @returns {string} O nome formatado com HTML para exibição.
     */
    function formatSaintName(name) {
        if (!name) return 'Desconhecido';
        
        // Divide a string em um array se houver múltiplos nomes separados por " / "
        const names = name.split(' / ');
        
        // Processa cada nome individualmente
        return names.map(n => {
            // Cria um elemento temporário para sanitizar o texto (evita ataques XSS)
            const temp = document.createElement('div');
            temp.textContent = n.trim();
            return temp.innerHTML; // Retorna o texto seguro
        }).join('<br>'); // Junta os nomes com a tag de quebra de linha HTML
    }

    /**
     * Função auxiliar para sanitizar strings simples.
     * @param {string} str Texto a ser sanitizado.
     * @returns {string} Texto seguro para inserção no HTML.
     */
    function sanitize(str) {
        if (!str) return '';
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }

    /**
     * Atualiza os elementos da interface do usuário com os dados do santo ou celebração.
     * @param {Object|null} saint Objeto contendo os dados do santo, ou null se não encontrado.
     */
    function updateUI(saint) {
        // Mapeamento dos elementos do DOM
        const elements = {
            name: document.querySelector('.santo-name'),
            type: document.querySelector('.santo-type'),
            desc: document.querySelector('.santo-description'),
            ribbon: document.querySelector('.santo-ribbon')
        };

        // Verifica se todos os elementos necessários existem na página
        if (!elements.name || !elements.type || !elements.desc || !elements.ribbon) return;

        // Caso não haja dados para a data solicitada
        if (!saint) {
            elements.name.textContent = 'Dia de hoje não encontrado na base de dados';
            elements.type.textContent = '--';
            elements.desc.textContent = 'Verifique o calendário litúrgico';
            elements.ribbon.style.backgroundColor = '#FFFFFF';
            return;
        }

        /**
         * ATUALIZAÇÃO DOS DADOS
         * Usa innerHTML para o nome pois pode conter as tags <br> geradas pelo formatSaintName.
         */
        elements.name.innerHTML = formatSaintName(saint.name);
        elements.type.textContent = sanitize(saint.type) || '--';
        elements.desc.textContent = sanitize(saint.description) || 'Celebração litúrgica';
        
        // Define a cor da fita litúrgica (Roxo, Branco, Verde, Vermelho, etc)
        elements.ribbon.style.backgroundColor = saint.color || '#FFFFFF';
    }

    /**
     * Calcula a data litúrgica correta seguindo as normas da Igreja.
     * Regras especiais (v2.4.0):
     * - Aos SABADOS, após as 15h (Vésperas), a liturgia já pertence ao DOMINGO seguinte.
     * - Aos DOMINGOS, após as 15h (Vésperas), a liturgia já pertence à SEGUNDA-FEIRA seguinte.
     * @returns {string} Data formatada como YYYY-MM-DD.
     */
    function getLiturgicalDate() {
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0=Domingo, 1=Segunda, ..., 6=Sábado
        const hours = now.getHours();
        
        // Se for SABADO (6) e passar das 15h, adianta para DOMINGO
        if (dayOfWeek === 6 && hours >= 15) {
            now.setDate(now.getDate() + 1);
            console.log('[SaintModule] Sábado após 15h detectado - avançando para Domingo');
        }
        // Se for DOMINGO (0) e passar das 15h, adianta para SEGUNDA-FEIRA
        else if (dayOfWeek === 0 && hours >= 15) {
            now.setDate(now.getDate() + 1);
            console.log('[SaintModule] Domingo após 15h detectado - avançando para Segunda-feira');
        }
        
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Garante 2 dígitos no mês
        const day = String(now.getDate()).padStart(2, '0');         // Garante 2 dígitos no dia
        
        return `${year}-${month}-${day}`;
    }

    /**
     * Busca os dados do calendário no servidor e atualiza a tela.
     */
    async function refresh() {
        const today = getLiturgicalDate();
        
        // Se a data não mudou desde a última verificação, não faz nada
        if (today === lastProcessedDate) return;

        try {
            // Busca o arquivo JSON contendo o calendário anual
            const response = await fetch('database/assets/dev/DATA/calendario.json');
            if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
            
            const calendar = await response.json();
            
            // Procura a entrada correspondente à data litúrgica calculada
            const entry = calendar.find(item => item.date === today);
            
            if (entry && entry.saint) {
                updateUI(entry.saint);
                lastProcessedDate = today; // Marca como processado
                console.log(`[SaintModule] Calendário atualizado para a data litúrgica: ${today}`);
            } else {
                updateUI(null); // Caso a data não exista no JSON
            }
        } catch (error) {
            console.error('[SaintModule] Erro crítico ao carregar calendário:', error);
            updateUI(null);
        }
    }

    /**
     * Expõe o método de inicialização pública.
     */
    return {
        init: function() {
            console.log('[SaintModule] Inicializando...'); refresh();
            
            // Configura uma verificação automática a cada 60 segundos
            // Isso garante que a data mude automaticamente se o app ficar aberto durante a virada do dia
            setInterval(refresh, 60000);
        }
    };
})();

/**
 * Inicialização segura do módulo após o carregamento do DOM.
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', SaintModule.init);
} else {
    SaintModule.init();
}
