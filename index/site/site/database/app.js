// Estado da aplicação
let currentPath = "root";
let currentPreviewFile = null;
let fileStructure = {}; 

let files = [];
let selectedFiles = [];
let viewMode = "grid";

// Elementos DOM
const elements = {
    fileContainer: document.getElementById("file-container"),
    breadcrumbPath: document.getElementById("breadcrumb-path"),
    gridViewBtn: document.getElementById("grid-view"),
    listViewBtn: document.getElementById("list-view"),
    selectAllBtn: document.getElementById("select-all"),
    clearSelectionBtn: document.getElementById("clear-selection"),
    downloadSelectedBtn: document.getElementById("download-selected"),
    selectionInfo: document.getElementById("selection-info"),
    selectionCount: document.getElementById("selection-count"),
    selectionSize: document.getElementById("selection-size"),
    previewModal: document.getElementById("preview-modal"),
    previewTitle: document.getElementById("preview-title"),
    previewContent: document.getElementById("preview-content"),
    closePreview: document.getElementById("close-preview"),
    downloadPreview: document.getElementById("download-preview"),
};

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
    initializeEventListeners();
    loadAndRenderFileStructure();
});

// Escuta mudanças na URL (botão voltar do navegador)
window.addEventListener('popstate', (event) => {
    const path = event.state?.path || getPathFromUrl() || "root";
    loadFilesFromPath(path, false);
});

function initializeEventListeners() {
    if (elements.gridViewBtn) elements.gridViewBtn.addEventListener("click", () => setViewMode("grid"));
    if (elements.listViewBtn) elements.listViewBtn.addEventListener("click", () => setViewMode("list"));
    if (elements.selectAllBtn) elements.selectAllBtn.addEventListener("click", selectAll);
    if (elements.clearSelectionBtn) elements.clearSelectionBtn.addEventListener("click", clearSelection);
    if (elements.downloadSelectedBtn) elements.downloadSelectedBtn.addEventListener("click", downloadSelected);
    if (elements.closePreview) elements.closePreview.addEventListener("click", closePreview);

    if (elements.previewModal) {
        elements.previewModal.addEventListener("click", (e) => {
            if (e.target === elements.previewModal) closePreview();
        });
    }
}

function getPathFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('path');
}

async function loadAndRenderFileStructure() {
    try {
        const response = await fetch("file_structure.json");
        if (!response.ok) throw new Error("Erro ao carregar file_structure.json");
        
        fileStructure = await response.json();
        calculateFolderSizes();
        
        // Define o caminho inicial baseado na URL ou 'root'
        const initialPath = getPathFromUrl() || "root";
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
            currentEntry.files.forEach(file => {
                currentTotalSize += file.size || 0;
            });
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
        if (currentEntry) {
            currentEntry.totalSize = currentTotalSize;
        }
        return currentTotalSize;
    }

    Object.keys(fileStructure).forEach(path => {
        if (fileStructure[path].totalSize === undefined) {
            calculateSizeForPath(path);
        }
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
    
    selectedFiles = [];
    updateBreadcrumb();
    renderFiles();

    // Atualiza a URL sem recarregar a página
    if (pushState) {
        const newUrl = path === "root" ? "/database" : `/database?path=${path}`;
        window.history.pushState({ path: path }, "", newUrl);
    }
}

function updateBreadcrumb() {
    elements.breadcrumbPath.innerHTML = ""; // Limpa para reconstruir com segurança
    
    // Botão Voltar (Home do Site)
    const homeBtn = document.createElement("span");
    homeBtn.textContent = "🏠";
    homeBtn.style.cursor = "pointer";
    homeBtn.style.color = "#666";
    homeBtn.style.marginRight = "10px";
    homeBtn.title = "Voltar para o Início";
    homeBtn.onclick = () => window.location.href = '/';
    elements.breadcrumbPath.appendChild(homeBtn);
    
    // Database Root
    const rootBtn = document.createElement("span");
    rootBtn.textContent = "database";
    rootBtn.style.cursor = "pointer";
    rootBtn.style.color = "#3b82f6";
    rootBtn.onclick = () => loadFilesFromPath('root');
    elements.breadcrumbPath.appendChild(rootBtn);
    
    if (currentPath !== "root") {
        const parts = currentPath.split("/");
        let pathBuild = "";
        parts.forEach(part => {
            if (part && part !== "root") {
                pathBuild += (pathBuild ? "/" : "") + part;
                const currentPathBuild = pathBuild;
                
                const separator = document.createTextNode(" / ");
                elements.breadcrumbPath.appendChild(separator);
                
                const partBtn = document.createElement("span");
                partBtn.textContent = part;
                partBtn.style.cursor = "pointer";
                partBtn.style.color = "#3b82f6";
                partBtn.onclick = () => loadFilesFromPath(currentPathBuild);
                elements.breadcrumbPath.appendChild(partBtn);
            }
        });
    }
}

function displayEmptyState(message = "Nenhum arquivo encontrado.") {
    elements.fileContainer.innerHTML = "";
    const emptyDiv = document.createElement("div");
    emptyDiv.style.textAlign = "center";
    emptyDiv.style.padding = "60px 20px";
    emptyDiv.style.color = "#999";
    
    const icon = document.createElement("div");
    icon.style.fontSize = "48px";
    icon.style.marginBottom = "20px";
    icon.textContent = "📁";
    
    const title = document.createElement("h2");
    title.style.color = "#666";
    title.style.margin = "0 0 10px 0";
    title.textContent = "Vazio";
    
    const text = document.createElement("p");
    text.style.margin = "0";
    text.style.fontSize = "14px";
    text.textContent = message;
    
    emptyDiv.appendChild(icon);
    emptyDiv.appendChild(title);
    emptyDiv.appendChild(text);
    elements.fileContainer.appendChild(emptyDiv);
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
        files.forEach(file => {
            const card = document.createElement("div");
            card.className = `file-card ${file.isDirectory ? "directory" : ""} ${selectedFiles.includes(file.id) ? "selected" : ""}`;
            
            // Checkbox
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.className = "file-checkbox";
            checkbox.checked = selectedFiles.includes(file.id);
            card.appendChild(checkbox);

            // Icon/Preview
            const iconDiv = document.createElement("div");
            if (!file.isDirectory && file.type === "image" && file.preview) {
                iconDiv.className = "file-preview";
                const img = document.createElement("img");
                img.src = file.preview;
                img.onerror = () => { img.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22%3E%3Ctext x=%2212%22 y=%2216%22 text-anchor=%22middle%22 font-size=%2210%22 fill=%22%23999%22%3E?%3C/text%3E%3C/svg%3E'; };
                iconDiv.appendChild(img);
            } else {
                iconDiv.className = "file-icon";
                iconDiv.innerHTML = getFileIcon(file); // getFileIcon retorna SVG seguro
            }
            card.appendChild(iconDiv);

            // Name
            const nameDiv = document.createElement("div");
            nameDiv.className = "file-name";
            nameDiv.textContent = file.name;
            card.appendChild(nameDiv);

            // Info
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
        
        const thead = document.createElement("thead");
        thead.innerHTML = "<tr><th></th><th>Nome</th><th>Tamanho</th><th>Modificado</th></tr>";
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        files.forEach(file => {
            const tr = document.createElement("tr");
            if (selectedFiles.includes(file.id)) tr.className = "selected";
            
            // Checkbox Cell
            const tdCheck = document.createElement("td");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = selectedFiles.includes(file.id);
            tdCheck.appendChild(checkbox);
            tr.appendChild(tdCheck);

            // Name Cell
            const tdName = document.createElement("td");
            const iconSpan = document.createElement("span");
            iconSpan.innerHTML = getFileIcon(file, true);
            tdName.appendChild(iconSpan);
            tdName.appendChild(document.createTextNode(" " + file.name));
            tr.appendChild(tdName);

            // Size Cell
            const tdSize = document.createElement("td");
            const size = file.isDirectory ? getFolderSize(file.id) : file.size;
            tdSize.textContent = formatFileSize(size);
            tr.appendChild(tdSize);

            // Date Cell
            const tdDate = document.createElement("td");
            tdDate.textContent = file.modified ? new Date(file.modified).toLocaleDateString() : "-";
            tr.appendChild(tdDate);

            tr.onclick = (e) => handleFileClick(file, e);
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        elements.fileContainer.appendChild(table);
    }
    updateSelectionInfo();
}

function getFileIcon(file, isSmall = false) {
    const size = isSmall ? "20px" : "40px";
    if (file.isDirectory) return `<img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23facc15'%3E%3Cpath d='M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z'/%3E%3C/svg%3E" style="width: ${size};">`;
    
    const colors = { pdf: "#ef4444", archive: "#f59e0b", code: "#3b82f6", image: "#10b981", font: "#8b5cf6", default: "#94a3b8" };
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
        elements.selectionCount.textContent = `${selectedFiles.length} item(s)`;
        elements.downloadSelectedBtn.style.display = "inline-block";
    } else {
        elements.selectionInfo.style.display = "none";
        elements.downloadSelectedBtn.style.display = "none";
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

function openPreview(file) {
    elements.previewTitle.textContent = file.name;
    elements.previewContent.innerHTML = ""; // Limpa conteúdo anterior
    
    if (file.type === "image") {
        const img = document.createElement("img");
        img.src = file.path;
        img.style.maxWidth = "100%";
        img.style.maxHeight = "70vh";
        img.style.display = "block";
        img.style.margin = "0 auto";
        elements.previewContent.appendChild(img);
    } else {
        const div = document.createElement("div");
        div.style.textAlign = "center";
        div.style.padding = "40px";
        
        const icon = document.createElement("div");
        icon.style.fontSize = "64px";
        icon.textContent = "📄";
        
        const text = document.createElement("p");
        text.textContent = "Sem pré-visualização.";
        
        div.appendChild(icon);
        div.appendChild(text);
        elements.previewContent.appendChild(div);
    }
    elements.previewModal.style.display = "flex";
}

function closePreview() {
    elements.previewModal.style.display = "none";
}

function downloadSelected() { alert("Download ZIP não disponível."); }
