// Estado da aplicação
let currentPath = "database_root";
let fileStructure = {};
let files = [];
let selectedFiles = [];
let viewMode = "grid";
let uploadQueue = [];
let isUploading = false;
let uploadViewMode = "list"; // "list" ou "grid"
let sortMode = "name-asc"; // Modo de ordenação padrão

// Clipboard interno para CTRL+C / CTRL+V
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

// Inicialização
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


function updateBackgroundUploadUI() {
    const progress = JSON.parse(localStorage.getItem('uploadProgress'));
    if (progress && elements.bgIndicator) {
        elements.bgIndicator.style.display = "block";
        elements.bgFilename.textContent = progress.file;
        elements.bgPercent.textContent = progress.percent + "%";
        elements.bgSpeed.textContent = progress.speed;
        elements.bgBar.style.width = progress.percent + "%";
        elements.bgCount.textContent = `${progress.current} / ${progress.total} arquivos`;
    } else if (elements.bgIndicator) {
        elements.bgIndicator.style.display = "none";
    }
}

function initializeEventListeners() {
    if (elements.gridViewBtn) elements.gridViewBtn.addEventListener("click", () => setViewMode("grid"));
    if (elements.listViewBtn) elements.listViewBtn.addEventListener("click", () => setViewMode("list"));
    if (elements.selectAllBtn) elements.selectAllBtn.addEventListener("click", selectAll);
    if (elements.clearSelectionBtn) elements.clearSelectionBtn.addEventListener("click", clearSelection);
    if (elements.downloadSelectedBtn) elements.downloadSelectedBtn.addEventListener("click", downloadSelected);
    if (elements.shareSelectedBtn) elements.shareSelectedBtn.addEventListener("click", shareSelected);
    if (elements.closePreview) elements.closePreview.addEventListener("click", closePreview);
    
    // Upload Events
    if (elements.uploadTrigger) elements.uploadTrigger.addEventListener("click", () => elements.fileInput.click());
    if (elements.fileInput) elements.fileInput.addEventListener("change", handleFileSelection);
    if (elements.closeUpload) elements.closeUpload.addEventListener("click", () => elements.uploadModal.style.display = "none");
    if (elements.cancelUpload) elements.cancelUpload.addEventListener("click", () => elements.uploadModal.style.display = "none");
    if (elements.startUpload) elements.startUpload.addEventListener("click", startUploadProcess);
    
    // Alternância de visualização no upload
    if (elements.uploadViewList) elements.uploadViewList.addEventListener("click", () => setUploadViewMode("list"));
    if (elements.uploadViewGrid) elements.uploadViewGrid.addEventListener("click", () => setUploadViewMode("grid"));
    
    // Ordenação
    if (elements.sortSelect) elements.sortSelect.addEventListener("change", (e) => {
        sortMode = e.target.value;
        renderFiles();
    });
    
    if (elements.selectAllUpload) {
        elements.selectAllUpload.addEventListener("change", (e) => {
            const checkboxes = elements.uploadList.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(cb => cb.checked = e.target.checked);
        });
    }

    if (elements.previewModal) {
        elements.previewModal.addEventListener("click", (e) => {
            if (e.target === elements.previewModal) closePreview();
        });
    }

    // ── Atalhos de teclado globais ──────────────────────────────────────────
    document.addEventListener("keydown", handleKeyboardShortcuts);
}

// ── Atalhos de teclado: CTRL+A, CTRL+C, CTRL+V ─────────────────────────────
function handleKeyboardShortcuts(e) {
    // Ignorar quando o foco está em inputs, textareas ou modais abertos
    const tag = document.activeElement.tagName.toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return;
    if (elements.uploadModal && elements.uploadModal.style.display !== "none") return;
    if (elements.previewModal && elements.previewModal.style.display !== "none") return;

    const isCtrl = e.ctrlKey || e.metaKey;

    if (isCtrl && e.key === "a") {
        e.preventDefault();
        selectAll();
        showNotification("Todos os arquivos selecionados", "info");
    }

    if (isCtrl && e.key === "c") {
        if (selectedFiles.length === 0) return;
        e.preventDefault();
        clipboardFiles = [...selectedFiles];
        showNotification(`${clipboardFiles.length} arquivo(s) copiado(s) para a área de transferência`, "success");
    }

    if (isCtrl && e.key === "v") {
        if (clipboardFiles.length === 0) return;
        e.preventDefault();
        pasteFiles();
    }
}

// Cola os arquivos copiados na pasta atual (download dos arquivos selecionados como ação de "colar")
function pasteFiles() {
    if (clipboardFiles.length === 0) {
        showNotification("Nenhum arquivo na área de transferência", "warning");
        return;
    }

    let pasted = 0;
    for (const id of clipboardFiles) {
        const file = findFileById(id);
        if (file && !file.isDirectory) {
            const a = document.createElement('a');
            a.href = "/" + file.path;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            pasted++;
        }
    }

    if (pasted > 0) {
        showNotification(`${pasted} arquivo(s) colado(s) (download iniciado)`, "success");
    } else {
        showNotification("Nenhum arquivo válido para colar", "warning");
    }
}

function getPathFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('path');
}

async function loadAndRenderFileStructure() {
    try {
        const response = await fetch("/database/philistudies.json?v=" + new Date().getTime());
        if (!response.ok) throw new Error("Erro ao carregar philistudies.json");
        
        fileStructure = await response.json();
        calculateFolderSizes();
        
        const initialPath = getPathFromUrl() || "database_root";
        loadFilesFromPath(initialPath, false);
    } catch (error) {
        console.error("Erro:", error);
        displayEmptyState("Erro ao carregar a estrutura de arquivos.");
    }
}

function calculateFolderSizes() {
    function calculateSizeForPath(path) {
        let currentTotalSize = 0;
        const currentEntry = fileStructure[path];
        if (currentEntry && currentEntry.files) {
            currentEntry.files.forEach(file => { currentTotalSize += file.size || 0; });
        }
        if (currentEntry && currentEntry.folders) {
            currentEntry.folders.forEach(folder => {
                const folderPath = folder.id;
                if (fileStructure[folderPath] && fileStructure[folderPath].totalSize === undefined) {
                    calculateSizeForPath(folderPath);
                }
                currentTotalSize += fileStructure[folderPath]?.totalSize || 0;
            });
        }
        if (currentEntry) currentEntry.totalSize = currentTotalSize;
        return currentTotalSize;
    }
    Object.keys(fileStructure).forEach(path => {
        if (fileStructure[path].totalSize === undefined) calculateSizeForPath(path);
    });
}

function getFolderSize(path) {
    return fileStructure[path]?.totalSize || 0;
}

function loadFilesFromPath(path, pushState = true) {
    currentPath = path;
    const entry = fileStructure[path];
    if (entry) {
        files = [
            ...(entry.folders || []).map(f => ({...f, isDirectory: true})),
            ...(entry.files || [])
        ];
    } else {
        files = [];
    }
    // ── NÃO zeramos selectedFiles aqui para manter seleção persistente ──
    // selectedFiles é mantido entre navegações; apenas removemos IDs que
    // não existem mais na estrutura atual para evitar seleções fantasmas.
    selectedFiles = selectedFiles.filter(id => findFileById(id) !== null);
    updateBreadcrumb();
    renderFiles();
    if (pushState) {
        const newUrl = path === "database_root" ? "/database" : `/database?path=${path}`;
        window.history.pushState({ path: path }, "", newUrl);
    }
}

function updateBreadcrumb() {
    elements.breadcrumbPath.innerHTML = "";
    const rootBtn = document.createElement("span");
    rootBtn.textContent = "database";
    rootBtn.style.cursor = "pointer";
    rootBtn.onclick = () => loadFilesFromPath('database_root');
    elements.breadcrumbPath.appendChild(rootBtn);

    if (currentPath !== "database_root") {
        const parts = currentPath.replace("database/", "").split("/");
        let pathBuild = "database";
        parts.forEach((part) => {
            if (part && part !== "files") {
                pathBuild += "/" + part;
                const currentPathBuild = pathBuild;
                elements.breadcrumbPath.appendChild(document.createTextNode(" / "));
                const partBtn = document.createElement("span");
                partBtn.textContent = part;
                partBtn.style.cursor = "pointer";
                partBtn.onclick = () => loadFilesFromPath(currentPathBuild);
                elements.breadcrumbPath.appendChild(partBtn);
            }
        });
    }
}

function displayEmptyState(message = "Nenhum arquivo encontrado.") {
    elements.fileContainer.innerHTML = `<div style="text-align:center; padding:60px; color:#999;">
        <div style="font-size:48px; margin-bottom:20px;">📁</div>
        <h2>Vazio</h2>
        <p>${message}</p>
    </div>`;
}

function sortFiles(filesToSort) {
    const sorted = [...filesToSort];
    
    switch(sortMode) {
        case "name-asc":
            sorted.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case "name-desc":
            sorted.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case "size-asc":
            sorted.sort((a, b) => {
                const sizeA = a.isDirectory ? getFolderSize(a.id) : a.size;
                const sizeB = b.isDirectory ? getFolderSize(b.id) : b.size;
                return sizeA - sizeB;
            });
            break;
        case "size-desc":
            sorted.sort((a, b) => {
                const sizeA = a.isDirectory ? getFolderSize(a.id) : a.size;
                const sizeB = b.isDirectory ? getFolderSize(b.id) : b.size;
                return sizeB - sizeA;
            });
            break;
        case "date-asc":
            sorted.sort((a, b) => (a.modified || 0) - (b.modified || 0));
            break;
        case "date-desc":
            sorted.sort((a, b) => (b.modified || 0) - (a.modified || 0));
            break;
    }
    
    return sorted;
}

function renderFiles() {
    elements.fileContainer.innerHTML = "";
    if (files.length === 0) {
        displayEmptyState();
        return;
    }

    if (viewMode === "grid") {
        const grid = document.createElement("div");
        grid.className = "file-grid";
        const sortedFiles = sortFiles(files);
        sortedFiles.forEach(file => {
            const card = document.createElement("div");
            card.className = `file-card ${file.isDirectory ? "directory" : ""} ${selectedFiles.includes(file.id) ? "selected" : ""}`;
            
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.className = "file-checkbox";
            checkbox.checked = selectedFiles.includes(file.id);
            card.appendChild(checkbox);

            const iconDiv = document.createElement("div");
            if (!file.isDirectory && file.type === "image" && file.preview) {
                iconDiv.className = "file-preview";
                const img = document.createElement("img");
                img.src = "/" + file.path;
                img.onerror = () => { img.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22%3E%3Ctext x=%2212%22 y=%2216%22 text-anchor=%22middle%22 font-size=%2210%22 fill=%22%23999%22%3E?%3C/text%3E%3C/svg%3E'; };
                iconDiv.appendChild(img);
            } else if (!file.isDirectory && file.type === "video") {
                // Thumbnail de vídeo
                iconDiv.className = "file-preview file-preview-video";
                iconDiv.innerHTML = getVideoThumbnail(file);
            } else {
                iconDiv.className = "file-icon";
                iconDiv.innerHTML = getFileIcon(file);
            }
            card.appendChild(iconDiv);

            const nameDiv = document.createElement("div");
            nameDiv.className = "file-name";
            nameDiv.textContent = file.name;
            card.appendChild(nameDiv);

            const infoDiv = document.createElement("div");
            infoDiv.className = "file-info";
            const size = file.isDirectory ? getFolderSize(file.id) : file.size;
            infoDiv.textContent = formatFileSize(size);
            card.appendChild(infoDiv);
            
            card.onclick = (e) => handleFileClick(file, e);
            grid.appendChild(card);
        });
        elements.fileContainer.appendChild(grid);
    } else {
        const table = document.createElement("table");
        table.className = "file-list";
        table.innerHTML = `<thead><tr><th></th><th>Nome</th><th>Tamanho</th><th>Modificado</th></tr></thead>`;
        const tbody = document.createElement("tbody");
        const sortedFiles = sortFiles(files);
        sortedFiles.forEach(file => {
            const tr = document.createElement("tr");
            if (selectedFiles.includes(file.id)) tr.className = "selected";
            const size = file.isDirectory ? getFolderSize(file.id) : file.size;
            tr.innerHTML = `
                <td><input type="checkbox" ${selectedFiles.includes(file.id) ? "checked" : ""}></td>
                <td>${getFileIcon(file, true)} ${file.name}</td>
                <td>${formatFileSize(size)}</td>
                <td>${file.modified ? new Date(file.modified).toLocaleDateString() : "-"}</td>
            `;
            tr.onclick = (e) => handleFileClick(file, e);
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        elements.fileContainer.appendChild(table);
    }
    updateSelectionInfo();
}

function getVideoThumbnail(file) {
    return `<div style="position:relative; width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:#1e293b; border-radius:8px;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#8b5cf6" style="width:40px; height:40px;">
            <path d="M8 5v14l11-7z"/>
        </svg>
        <span style="position:absolute; bottom:4px; right:6px; font-size:0.6rem; color:#94a3b8; text-transform:uppercase;">${file.extension}</span>
    </div>`;
}

function getFileIcon(file, isSmall = false) {
    const size = isSmall ? "20px" : "40px";
    if (file.isDirectory) return `<img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23facc15'%3E%3Cpath d='M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z'/%3E%3C/svg%3E" style="width: ${size};">`;
    const colors = { pdf: "#ef4444", archive: "#f59e0b", code: "#3b82f6", image: "#10b981", video: "#8b5cf6", audio: "#ec4899", font: "#8b5cf6", default: "#94a3b8" };
    const color = colors[file.type] || colors.default;
    return `<img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='${encodeURIComponent(color)}'%3E%3Cpath d='M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z'/%3E%3C/svg%3E" style="width: ${size};">`;
}

function handleFileClick(file, event) {
    if (event.target.type === "checkbox") {
        toggleSelection(file.id);
    } else if (file.isDirectory) {
        loadFilesFromPath(file.id);
    } else {
        openPreview(file);
    }
}

function toggleSelection(id) {
    const index = selectedFiles.indexOf(id);
    if (index === -1) selectedFiles.push(id);
    else selectedFiles.splice(index, 1);
    renderFiles();
}

function selectAll() {
    selectedFiles = files.map(f => f.id);
    renderFiles();
}

function clearSelection() {
    selectedFiles = [];
    renderFiles();
}

function updateSelectionInfo() {
    if (selectedFiles.length > 0) {
        elements.selectionInfo.style.display = "flex";
        let totalSize = 0;
        selectedFiles.forEach(id => {
            const file = findFileById(id);
            if (file) totalSize += (file.isDirectory ? getFolderSize(file.id) : file.size) || 0;
        });
        if (elements.selectionCount) elements.selectionCount.textContent = `${selectedFiles.length} arquivo(s) selecionado(s)`;
        if (elements.selectionSize) elements.selectionSize.textContent = formatFileSize(totalSize);
        elements.downloadSelectedBtn.style.display = "inline-block";
        if (elements.shareSelectedBtn) elements.shareSelectedBtn.style.display = "inline-block";
    } else {
        elements.selectionInfo.style.display = "none";
        elements.downloadSelectedBtn.style.display = "none";
        if (elements.shareSelectedBtn) elements.shareSelectedBtn.style.display = "none";
    }
}

function setViewMode(mode) {
    viewMode = mode;
    renderFiles();
}

function formatFileSize(bytes) {
    if (!bytes) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(2) + " " + ["Bytes", "KB", "MB", "GB"][i];
}

// ── Notificações ─────────────────────────────────────────────────────────────
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

// --- Lógica de Upload ---

function handleFileSelection(e) {
    const selectedFilesArr = Array.from(e.target.files);
    if (selectedFilesArr.length === 0) return;

    uploadQueue = selectedFilesArr;
    renderUploadList();
    elements.uploadModal.style.display = "flex";
    elements.progressContainer.style.display = "none";
    elements.startUpload.disabled = false;

    // Resetar o input para permitir selecionar os mesmos arquivos novamente
    e.target.value = "";
}

function renderUploadList() {
    elements.uploadList.innerHTML = "";
    elements.uploadGrid.innerHTML = "";
    
    uploadQueue.forEach((file, index) => {
        if (uploadViewMode === "list") {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><input type="checkbox" checked data-index="${index}"></td>
                <td>${file.name}</td>
                <td>${formatFileSize(file.size)}</td>
                <td>${file.type || 'Desconhecido'}</td>
            `;
            elements.uploadList.appendChild(tr);
        } else {
            // Visualização em grade com ícone/preview
            const card = document.createElement("div");
            card.style.cssText = "border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center; position: relative;";
            
            // Checkbox
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = true;
            checkbox.dataset.index = index;
            checkbox.style.cssText = "position: absolute; top: 5px; right: 5px; width: 18px; height: 18px; cursor: pointer;";
            card.appendChild(checkbox);
            
            // Ícone ou preview
            const iconDiv = document.createElement("div");
            iconDiv.style.cssText = "width: 80px; height: 80px; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; border-radius: 6px; background: #f1f5f9; overflow: hidden;";
            
            if (file.type && file.type.startsWith("image/")) {
                // Preview de imagem
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement("img");
                    img.src = e.target.result;
                    img.style.cssText = "max-width: 100%; max-height: 100%; border-radius: 4px; object-fit: cover;";
                    iconDiv.innerHTML = "";
                    iconDiv.appendChild(img);
                };
                reader.readAsDataURL(file);
            } else if (file.type && file.type.startsWith("video/")) {
                // Preview de vídeo com thumbnail gerado via canvas
                const video = document.createElement("video");
                video.src = URL.createObjectURL(file);
                video.style.cssText = "display:none;";
                video.muted = true;
                video.currentTime = 1;
                video.addEventListener("loadeddata", () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = 80;
                    canvas.height = 80;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(video, 0, 0, 80, 80);
                    const img = document.createElement("img");
                    img.src = canvas.toDataURL("image/jpeg");
                    img.style.cssText = "max-width: 100%; max-height: 100%; border-radius: 4px; object-fit: cover;";
                    iconDiv.innerHTML = "";
                    iconDiv.appendChild(img);
                    URL.revokeObjectURL(video.src);
                });
                document.body.appendChild(video);
                video.load();
                // Fallback enquanto carrega
                iconDiv.innerHTML = getUploadFileIcon(file.name.split('.').pop().toLowerCase());
            } else {
                // Ícone baseado no tipo
                const ext = file.name.split('.').pop().toLowerCase();
                iconDiv.innerHTML = getUploadFileIcon(ext);
            }
            card.appendChild(iconDiv);
            
            // Nome
            const nameDiv = document.createElement("div");
            nameDiv.style.cssText = "font-size: 0.85rem; font-weight: 600; word-break: break-word; margin-bottom: 5px;";
            nameDiv.textContent = file.name;
            card.appendChild(nameDiv);
            
            // Tamanho
            const sizeDiv = document.createElement("div");
            sizeDiv.style.cssText = "font-size: 0.75rem; color: #64748b;";
            sizeDiv.textContent = formatFileSize(file.size);
            card.appendChild(sizeDiv);
            
            elements.uploadGrid.appendChild(card);
        }
    });
}

function getUploadFileIcon(ext) {
    const iconMap = {
        pdf: { color: "#ef4444", char: "📄" },
        zip: { color: "#f59e0b", char: "📦" },
        rar: { color: "#f59e0b", char: "📦" },
        "7z": { color: "#f59e0b", char: "📦" },
        jpg: { color: "#10b981", char: "🖼️" },
        jpeg: { color: "#10b981", char: "🖼️" },
        png: { color: "#10b981", char: "🖼️" },
        gif: { color: "#10b981", char: "🖼️" },
        webp: { color: "#10b981", char: "🖼️" },
        mp4: { color: "#8b5cf6", char: "🎬" },
        webm: { color: "#8b5cf6", char: "🎬" },
        mov: { color: "#8b5cf6", char: "🎬" },
        avi: { color: "#8b5cf6", char: "🎬" },
        mkv: { color: "#8b5cf6", char: "🎬" },
        mp3: { color: "#ec4899", char: "🎵" },
        wav: { color: "#ec4899", char: "🎵" },
        flac: { color: "#ec4899", char: "🎵" },
        txt: { color: "#3b82f6", char: "📝" },
        json: { color: "#3b82f6", char: "{ }" },
        md: { color: "#3b82f6", char: "📝" },
        js: { color: "#f59e0b", char: "</>" },
        ts: { color: "#3b82f6", char: "</>" },
        html: { color: "#ef4444", char: "</>" },
        css: { color: "#3b82f6", char: "</>" },
        py: { color: "#10b981", char: "🐍" },
    };
    const icon = iconMap[ext] || { color: "#94a3b8", char: "📄" };
    return `<div style="font-size: 32px;">${icon.char}</div>`;
}

function setUploadViewMode(mode) {
    uploadViewMode = mode;
    
    // Atualizar botões
    if (elements.uploadViewList) {
        elements.uploadViewList.classList.toggle("active", mode === "list");
    }
    if (elements.uploadViewGrid) {
        elements.uploadViewGrid.classList.toggle("active", mode === "grid");
    }
    
    // Alternar visualização
    if (mode === "list") {
        elements.uploadTable.style.display = "table";
        elements.uploadGrid.style.display = "none";
    } else {
        elements.uploadTable.style.display = "none";
        elements.uploadGrid.style.display = "grid";
    }
    
    renderUploadList();
}

async function startUploadProcess() {
    const selectedCheckboxes = uploadViewMode === "list" 
        ? elements.uploadList.querySelectorAll('input[type="checkbox"]:checked')
        : elements.uploadGrid.querySelectorAll('input[type="checkbox"]:checked');
    
    const filesToUpload = Array.from(selectedCheckboxes).map(cb => uploadQueue[parseInt(cb.dataset.index)]);

    if (filesToUpload.length === 0) {
        alert("Selecione pelo menos um arquivo para upload.");
        return;
    }

    isUploading = true;
    elements.startUpload.disabled = true;
    elements.progressContainer.style.display = "block";
    
    const totalFiles = filesToUpload.length;
    let uploadedFiles = 0;
    let totalBytes = filesToUpload.reduce((acc, f) => acc + f.size, 0);
    let uploadedBytes = 0;
    let startTime = Date.now();

    // Fechar o modal após 1 segundo (upload continua em background)
    setTimeout(() => {
        elements.uploadModal.style.display = "none";
    }, 1000);

    for (const file of filesToUpload) {
        if (!isUploading) break;

        const formData = new FormData();
        formData.append("files[]", file);
        // ── Enviar o caminho atual para o backend salvar na pasta correta ──
        formData.append("current_path", currentPath);

        try {
            await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open("POST", "/database/upload", true);

                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        // e.loaded é o progresso do arquivo ATUAL. 
                        // uploadedBytes é a soma dos tamanhos dos arquivos JÁ COMPLETADOS.
                        let currentUploaded = uploadedBytes + e.loaded;
                        
                        // Garantir que não ultrapasse o totalBytes por arredondamento ou problemas de stream
                        if (currentUploaded > totalBytes) currentUploaded = totalBytes;
                        
                        let percent = Math.round((currentUploaded / totalBytes) * 100);
                        if (percent > 100) percent = 100;
                        const elapsed = (Date.now() - startTime) / 1000;
                        const speed = currentUploaded / elapsed;

                        // Atualizar localStorage para mostrar progresso em background
                        localStorage.setItem('uploadProgress', JSON.stringify({
                            percent: percent,
                            speed: formatFileSize(speed) + "/s",
                            file: file.name,
                            current: uploadedFiles + 1,
                            total: totalFiles
                        }));
                        updateBackgroundUploadUI();
                    }
                };

                xhr.onload = () => {
                    if (xhr.status === 200) {
                        uploadedFiles++;
                        uploadedBytes += file.size;
                    } else {
                        reject();
                    }
                    resolve();
                };

                xhr.onerror = reject;
                xhr.send(formData);
            });
        } catch (err) {
            console.error("Erro no upload de", file.name, err);
        }
    }

    isUploading = false;
    localStorage.removeItem('uploadProgress');
    loadAndRenderFileStructure();
    showNotification(`${uploadedFiles} arquivo(s) enviado(s) com sucesso!`, "success");
}

// --- Polling de Estrutura (7,5 segundos) ---

function startStructurePolling() {
    setInterval(async () => {
        if (isUploading) {
            await fetch("/database/generate-structure", { method: "POST" });
        }
        await loadAndRenderFileStructure();
        updateBackgroundUploadUI();
    }, 7500); // 7.5 segundos
}

// --- Funções Auxiliares ---

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

async function openPreview(file) {
    elements.previewTitle.textContent = file.name;
    elements.previewContent.innerHTML = "";

    // Configurar botão de download
    if (elements.downloadPreview) {
        elements.downloadPreview.onclick = () => {
            const a = document.createElement('a');
            a.href = "/" + file.path;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };
    }

    if (file.type === "image") {
        const img = document.createElement("img");
        img.src = "/" + file.path;
        img.style.maxWidth = "100%";
        img.style.maxHeight = "70vh";
        img.style.display = "block";
        img.style.margin = "0 auto";
        img.style.borderRadius = "8px";
        elements.previewContent.appendChild(img);

    } else if (file.type === "video") {
        // ── Preview de vídeo ──────────────────────────────────────────────
        const video = document.createElement("video");
        video.src = "/" + file.path;
        video.controls = true;
        video.autoplay = false;
        video.style.maxWidth = "100%";
        video.style.maxHeight = "70vh";
        video.style.display = "block";
        video.style.margin = "0 auto";
        video.style.borderRadius = "8px";
        video.style.background = "#000";
        elements.previewContent.appendChild(video);

    } else if (file.type === "pdf" || file.extension === "pdf") {
        // ── Preview de PDF via <iframe> ───────────────────────────────────
        const wrapper = document.createElement("div");
        wrapper.style.cssText = "width:100%; height:70vh; display:flex; flex-direction:column; gap:10px;";

        const iframe = document.createElement("iframe");
        iframe.src = "/" + file.path + "#toolbar=1&navpanes=0";
        iframe.style.cssText = "width:100%; flex:1; border:none; border-radius:8px; background:#f1f5f9;";
        iframe.title = file.name;

        // Fallback: link direto caso o browser bloqueie o iframe
        const fallback = document.createElement("p");
        fallback.style.cssText = "font-size:0.8rem; color:#64748b; text-align:center;";
        fallback.innerHTML = `Caso o PDF não apareça, <a href="/${file.path}" target="_blank" style="color:#3b82f6;">clique aqui para abrir</a>.`;

        wrapper.appendChild(iframe);
        wrapper.appendChild(fallback);
        elements.previewContent.appendChild(wrapper);

    } else if (file.type === "audio" || ["mp3", "wav", "flac", "ogg"].includes(file.extension)) {
        // ── Preview de áudio ──────────────────────────────────────────────
        const audio = document.createElement("audio");
        audio.src = "/" + file.path;
        audio.controls = true;
        audio.style.cssText = "width:100%; margin:20px auto; display:block;";
        elements.previewContent.appendChild(audio);

    } else if (file.extension === "md" || file.extension === "json" || file.type === "code") {
        try {
            const response = await fetch("/" + file.path);
            const content = await response.text();
            const pre = document.createElement("pre");
            pre.style.maxHeight = "70vh";
            pre.style.overflow = "auto";
            pre.style.padding = "20px";
            pre.style.backgroundColor = "#f1f5f9";
            pre.style.borderRadius = "8px";
            pre.style.fontSize = "0.85rem";
            pre.style.lineHeight = "1.6";
            pre.textContent = content.substring(0, 10000);
            elements.previewContent.appendChild(pre);
        } catch (error) {
            elements.previewContent.innerHTML = `<p style="color:#ef4444; padding:20px;">Erro ao carregar arquivo.</p>`;
        }
    } else {
        elements.previewContent.innerHTML = `
            <div style="text-align:center; padding:40px; color:#64748b;">
                <div style="font-size:48px; margin-bottom:16px;">📄</div>
                <p>Sem pré-visualização disponível para este tipo de arquivo.</p>
                <p style="font-size:0.85rem; margin-top:8px;">Use o botão "Baixar Arquivo" para abrir.</p>
            </div>`;
    }
    elements.previewModal.style.display = "flex";
}

function closePreview() {
    // Pausar vídeo/áudio ao fechar o modal
    const video = elements.previewContent.querySelector("video");
    if (video) video.pause();
    const audio = elements.previewContent.querySelector("audio");
    if (audio) audio.pause();
    elements.previewModal.style.display = "none";
}

async function downloadSelected() {
    if (selectedFiles.length === 0) return;
    for (const id of selectedFiles) {
        const file = findFileById(id);
        if (file && !file.isDirectory) {
            const a = document.createElement('a');
            a.href = "/" + file.path;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    }
}

function shareSelected() {
    if (selectedFiles.length === 0) return;
    const shareUrl = window.location.origin + window.location.pathname + "?share=" + selectedFiles.join(",");
    navigator.clipboard.writeText(shareUrl).then(() => {
        showNotification("Link copiado para a área de transferência!", "success");
    });
}
