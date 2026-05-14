/**
 * init.js - Inicialização da Aplicação
 * Responsável por: registrar event listeners, iniciar polling, carregar estrutura
 */

document.addEventListener("DOMContentLoaded", () => {
    initializeEventListeners();
    loadAndRenderFileStructure();
    startStructurePolling();
    updateBackgroundUploadUI();
});

// Escuta mudanças na URL
window.addEventListener('popstate', (event) => {
    const path = event.state?.path || getPathFromUrl() || "database_root";
    loadFilesFromPath(path, false);
});

function initializeEventListeners() {
    // View controls
    if (elements.gridViewBtn) elements.gridViewBtn.addEventListener("click", () => setViewMode("grid"));
    if (elements.listViewBtn) elements.listViewBtn.addEventListener("click", () => setViewMode("list"));
    
    // Selection controls
    if (elements.selectAllBtn) elements.selectAllBtn.addEventListener("click", selectAll);
    if (elements.clearSelectionBtn) elements.clearSelectionBtn.addEventListener("click", clearSelection);
    if (elements.downloadSelectedBtn) elements.downloadSelectedBtn.addEventListener("click", downloadSelected);
    if (elements.shareSelectedBtn) elements.shareSelectedBtn.addEventListener("click", shareSelected);
    
    // Preview modal
    if (elements.closePreview) elements.closePreview.addEventListener("click", closePreview);
    
    // Upload Events
    if (elements.uploadTrigger) elements.uploadTrigger.addEventListener("click", () => elements.fileInput.click());
    if (elements.fileInput) elements.fileInput.addEventListener("change", handleFileSelection);
    if (elements.closeUpload) elements.closeUpload.addEventListener("click", () => elements.uploadModal.style.display = "none");
    if (elements.cancelUpload) elements.cancelUpload.addEventListener("click", () => elements.uploadModal.style.display = "none");
    if (elements.startUpload) elements.startUpload.addEventListener("click", startUploadProcess);
    
    // Upload view mode toggle
    if (elements.uploadViewList) elements.uploadViewList.addEventListener("click", () => setUploadViewMode("list"));
    if (elements.uploadViewGrid) elements.uploadViewGrid.addEventListener("click", () => setUploadViewMode("grid"));
    
    // Sort
    if (elements.sortSelect) elements.sortSelect.addEventListener("change", (e) => {
        sortMode = e.target.value;
        renderFiles();
    });
    
    // Select all upload
    if (elements.selectAllUpload) {
        elements.selectAllUpload.addEventListener("change", (e) => {
            const checkboxes = elements.uploadList.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(cb => cb.checked = e.target.checked);
        });
    }

    // Preview modal click outside
    if (elements.previewModal) {
        elements.previewModal.addEventListener("click", (e) => {
            if (e.target === elements.previewModal) closePreview();
        });
    }

    // Atalhos de teclado globais
    document.addEventListener("keydown", handleKeyboardShortcuts);
}
