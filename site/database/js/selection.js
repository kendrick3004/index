/**
 * selection.js - Gerenciamento de Seleção e Atalhos de Teclado
 * Responsável por: seleção de arquivos, CTRL+A/C/V, clipboard interno, download de pastas como ZIP
 */

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

async function downloadSelected() {
    if (selectedFiles.length === 0) return;

    // Separar arquivos e pastas
    const filesToDownload = [];
    const foldersToDownload = [];

    for (const id of selectedFiles) {
        const file = findFileById(id);
        if (file) {
            if (file.isDirectory) {
                foldersToDownload.push(file);
            } else {
                filesToDownload.push(file);
            }
        }
    }

    // Se houver apenas arquivos, baixar normalmente
    if (filesToDownload.length > 0 && foldersToDownload.length === 0) {
        showNotification(`Baixando ${filesToDownload.length} arquivo(s)...`, "info");
        for (const file of filesToDownload) {
            const a = document.createElement('a');
            a.href = "/" + file.path;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
        showNotification(`${filesToDownload.length} arquivo(s) baixado(s)!`, "success");
        registrarLogDownload(filesToDownload, "arquivos");
        return;
    }

    // Se houver pastas, criar ZIP
    if (foldersToDownload.length > 0) {
        showNotification("Compactando pasta(s)...", "info");
        await criarZipDePastas(foldersToDownload, filesToDownload);
    }
}

async function criarZipDePastas(folders, files) {
    try {
        const zip = new JSZip();
        let arquivosAdicionados = 0;

        // Adicionar arquivos soltos
        for (const file of files) {
            const response = await fetch("/" + file.path);
            const blob = await response.blob();
            zip.file(file.name, blob);
            arquivosAdicionados++;
        }

        // Adicionar pastas
        for (const folder of folders) {
            showNotification(`Compactando: ${folder.name}...`, "info");
            await adicionarPastaAoZip(zip, folder, folder.name);
        }

        // Gerar ZIP
        showNotification("Finalizando compactação...", "info");
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const zipUrl = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = zipUrl;
        a.download = `download_${new Date().getTime()}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(zipUrl);

        showNotification("✅ Pastas compactadas e baixadas com sucesso!", "success");
        registrarLogDownload(folders, "pastas");
    } catch (error) {
        console.error("Erro ao criar ZIP:", error);
        showNotification("❌ Erro ao compactar pastas", "error");
    }
}

async function adicionarPastaAoZip(zip, folder, pastaName) {
    const entry = fileStructure[folder.id];
    if (!entry) return;

    // Adicionar arquivos da pasta
    if (entry.files) {
        for (const file of entry.files) {
            try {
                const response = await fetch("/" + file.path);
                const blob = await response.blob();
                zip.file(`${pastaName}/${file.name}`, blob);
            } catch (e) {
                console.warn(`Erro ao adicionar ${file.name} ao ZIP:`, e);
            }
        }
    }

    // Adicionar subpastas recursivamente
    if (entry.folders) {
        for (const subfolder of entry.folders) {
            await adicionarPastaAoZip(zip, subfolder, `${pastaName}/${subfolder.name}`);
        }
    }
}

function registrarLogDownload(items, tipo) {
    const timestamp = new Date().toLocaleString('pt-BR');
    const nomes = items.map(i => i.name).join(", ");
    const logMsg = `[${timestamp}] Download de ${tipo}: ${nomes}`;
    console.log(logMsg);
    // Aqui você pode enviar para o servidor se necessário
}

function shareSelected() {
    if (selectedFiles.length === 0) return;
    const shareUrl = window.location.origin + window.location.pathname + "?share=" + selectedFiles.join(",");
    navigator.clipboard.writeText(shareUrl).then(() => {
        showNotification("Link copiado para a área de transferência!", "success");
    });
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
