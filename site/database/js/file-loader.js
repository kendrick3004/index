/**
 * file-loader.js - Carregamento e Renderização de Arquivos
 * Responsável por: carregar estrutura JSON, calcular tamanhos, renderizar arquivos
 */

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

function setViewMode(mode) {
    viewMode = mode;
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
