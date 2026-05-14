/**
 * state.js - Gerenciamento de Estado da Aplicação
 * Responsável por: estado global, estrutura de arquivos, seleção e modo de visualização
 */

// Estado da aplicação
let currentPath = "database_root";
let fileStructure = {};
let files = [];
let selectedFiles = [];
let viewMode = "grid";
let uploadQueue = [];
let isUploading = false;
let uploadViewMode = "list";
let sortMode = "name-asc";
let clipboardFiles = [];

// Elementos DOM
const elements = {
    fileContainer: document.getElementById("file-container"),
    breadcrumbPath: document.getElementById("breadcrumb-path"),
    gridViewBtn: document.getElementById("grid-view"),
    listViewBtn: document.getElementById("list-view"),
    selectAllBtn: document.getElementById("select-all"),
    clearSelectionBtn: document.getElementById("clear-selection"),
    downloadSelectedBtn: document.getElementById("download-selected"),
    shareSelectedBtn: document.getElementById("share-selected"),
    selectionInfo: document.getElementById("selection-info"),
    selectionCount: document.getElementById("selection-count"),
    selectionSize: document.getElementById("selection-size"),
    previewModal: document.getElementById("preview-modal"),
    previewTitle: document.getElementById("preview-title"),
    previewContent: document.getElementById("preview-content"),
    closePreview: document.getElementById("close-preview"),
    downloadPreview: document.getElementById("download-preview"),
    
    // Upload
    uploadTrigger: document.getElementById("upload-trigger"),
    fileInput: document.getElementById("file-input"),
    uploadModal: document.getElementById("upload-modal"),
    uploadList: document.getElementById("upload-list"),
    uploadGrid: document.getElementById("upload-grid"),
    uploadTable: document.getElementById("upload-table"),
    uploadViewList: document.getElementById("upload-view-list"),
    uploadViewGrid: document.getElementById("upload-view-grid"),
    closeUpload: document.getElementById("close-upload"),
    cancelUpload: document.getElementById("cancel-upload"),
    startUpload: document.getElementById("start-upload"),
    selectAllUpload: document.getElementById("select-all-upload"),
    progressContainer: document.getElementById("upload-progress-container"),
    progressBar: document.getElementById("upload-progress-bar"),
    percentageText: document.getElementById("upload-percentage"),
    speedText: document.getElementById("upload-speed"),
    countText: document.getElementById("upload-count-info"),
    statusText: document.getElementById("upload-status-text"),
    
    // Ordenação
    sortSelect: document.getElementById("sort-select"),
    bgIndicator: document.getElementById("bg-upload-indicator"),
    bgFilename: document.getElementById("bg-upload-filename"),
    bgPercent: document.getElementById("bg-upload-percent"),
    bgSpeed: document.getElementById("bg-upload-speed"),
    bgBar: document.getElementById("bg-upload-bar"),
    bgCount: document.getElementById("bg-upload-count")
};

// Funções de Utilidade
function formatFileSize(bytes) {
    if (!bytes) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(2) + " " + ["Bytes", "KB", "MB", "GB"][i];
}

function showNotification(message, type = "info") {
    const colors = { info: "#3b82f6", success: "#10b981", warning: "#f59e0b", error: "#ef4444" };
    const notif = document.createElement("div");
    notif.className = "notification";
    notif.style.background = colors[type] || colors.info;
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(() => {
        notif.style.animation = "slideOut 0.3s ease-in forwards";
        setTimeout(() => notif.remove(), 300);
    }, 2500);
}

function getPathFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('path');
}

function findFileById(id) {
    for (const path in fileStructure) {
        const entry = fileStructure[path];
        const file = entry.files?.find(f => f.id === id);
        if (file) return file;
        const folder = entry.folders?.find(f => f.id === id);
        if (folder) return { ...folder, isDirectory: true };
    }
    return null;
}

function getFolderSize(path) {
    return fileStructure[path]?.totalSize || 0;
}
