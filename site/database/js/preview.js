/**
 * preview.js - Sistema de Preview Universal
 * Responsável por: visualizar TODOS os tipos de arquivo sem exceção
 */

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

    try {
        // Imagens
        if (file.type === "image") {
            const img = document.createElement("img");
            img.src = "/" + file.path;
            img.style.maxWidth = "100%";
            img.style.maxHeight = "70vh";
            img.style.display = "block";
            img.style.margin = "0 auto";
            img.style.borderRadius = "8px";
            elements.previewContent.appendChild(img);

        // Vídeos
        } else if (file.type === "video" || ["mp4", "webm", "ogg", "mov", "avi", "mkv"].includes(file.extension)) {
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

        // PDFs
        } else if (file.type === "pdf" || file.extension === "pdf") {
            const wrapper = document.createElement("div");
            wrapper.style.cssText = "width:100%; height:70vh; display:flex; flex-direction:column; gap:10px;";

            const iframe = document.createElement("iframe");
            iframe.src = "/" + file.path + "#toolbar=1&navpanes=0";
            iframe.style.cssText = "width:100%; flex:1; border:none; border-radius:8px; background:#f1f5f9;";
            iframe.title = file.name;

            const fallback = document.createElement("p");
            fallback.style.cssText = "font-size:0.8rem; color:#64748b; text-align:center;";
            fallback.innerHTML = `Caso o PDF não apareça, <a href="/${file.path}" target="_blank" style="color:#3b82f6;">clique aqui para abrir</a>.`;

            wrapper.appendChild(iframe);
            wrapper.appendChild(fallback);
            elements.previewContent.appendChild(wrapper);

        // Áudio
        } else if (file.type === "audio" || ["mp3", "wav", "flac", "ogg", "m4a", "aac"].includes(file.extension)) {
            const audio = document.createElement("audio");
            audio.src = "/" + file.path;
            audio.controls = true;
            audio.style.cssText = "width:100%; margin:20px auto; display:block;";
            elements.previewContent.appendChild(audio);

        // Código e Texto
        } else if (file.extension === "md" || file.extension === "json" || file.extension === "txt" || file.type === "code") {
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
            pre.style.fontFamily = "'Courier New', monospace";
            pre.textContent = content.substring(0, 50000);
            elements.previewContent.appendChild(pre);

        // Arquivos compactados
        } else if (file.type === "archive" || ["zip", "rar", "7z", "tar", "gz"].includes(file.extension)) {
            const wrapper = document.createElement("div");
            wrapper.style.cssText = "text-align:center; padding:40px; color:#64748b;";
            wrapper.innerHTML = `
                <div style="font-size:48px; margin-bottom:16px;">📦</div>
                <p>Arquivo compactado</p>
                <p style="font-size:0.85rem; margin-top:8px;">Clique em "Baixar Arquivo" para extrair.</p>
            `;
            elements.previewContent.appendChild(wrapper);

        // Fontes
        } else if (file.type === "font" || ["ttf", "otf", "woff", "woff2"].includes(file.extension)) {
            const wrapper = document.createElement("div");
            wrapper.style.cssText = "text-align:center; padding:40px; color:#64748b;";
            wrapper.innerHTML = `
                <div style="font-size:48px; margin-bottom:16px;">🔤</div>
                <p>Arquivo de fonte</p>
                <p style="font-size:0.85rem; margin-top:8px;">Clique em "Baixar Arquivo" para instalar.</p>
            `;
            elements.previewContent.appendChild(wrapper);

        // Outros tipos de arquivo
        } else {
            const wrapper = document.createElement("div");
            wrapper.style.cssText = "text-align:center; padding:40px; color:#64748b;";
            wrapper.innerHTML = `
                <div style="font-size:48px; margin-bottom:16px;">📄</div>
                <p>Arquivo: ${file.extension.toUpperCase() || "Desconhecido"}</p>
                <p style="font-size:0.85rem; margin-top:8px;">Clique em "Baixar Arquivo" para abrir.</p>
            `;
            elements.previewContent.appendChild(wrapper);
        }
    } catch (error) {
        console.error("Erro ao abrir preview:", error);
        const errorDiv = document.createElement("div");
        errorDiv.style.cssText = "text-align:center; padding:40px; color:#ef4444;";
        errorDiv.innerHTML = `
            <div style="font-size:48px; margin-bottom:16px;">⚠️</div>
            <p>Erro ao carregar preview</p>
            <p style="font-size:0.85rem; margin-top:8px;">Clique em "Baixar Arquivo" para tentar abrir.</p>
        `;
        elements.previewContent.appendChild(errorDiv);
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
