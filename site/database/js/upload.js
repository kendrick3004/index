/**
 * upload.js - Sistema de Upload
 * Responsável por: seleção de arquivos, preview no modal, envio para pasta correta
 */

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
                        const currentUploaded = uploadedBytes + e.loaded;
                        const percent = Math.round((currentUploaded / totalBytes) * 100);
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

function startStructurePolling() {
    setInterval(async () => {
        if (isUploading) {
            await fetch("/database/generate-structure", { method: "POST" });
        }
        await loadAndRenderFileStructure();
        updateBackgroundUploadUI();
    }, 3000); // 3 segundos para atualização mais rápida
}
