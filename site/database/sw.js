// Service Worker para gerenciar uploads em background
const CACHE_NAME = 'database-upload-v1';

self.addEventListener('install', (event) => {
    console.log('[SW] Service Worker instalado');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[SW] Service Worker ativado');
    self.clients.claim();
});

// Listener para Background Sync (quando a conexão volta)
self.addEventListener('sync', (event) => {
    if (event.tag === 'upload-sync') {
        event.waitUntil(processUploadQueue());
    }
});

// Listener para mensagens do cliente
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    if (event.data && event.data.type === 'QUEUE_UPLOAD') {
        queueUpload(event.data.file);
    }
});

async function queueUpload(fileData) {
    try {
        const db = await openDatabase();
        const tx = db.transaction('uploads', 'readwrite');
        const store = tx.objectStore('uploads');
        await store.add({
            id: Date.now(),
            filename: fileData.filename,
            data: fileData.data,
            timestamp: new Date().toISOString(),
            status: 'pending'
        });
        console.log('[SW] Upload enfileirado:', fileData.filename);
    } catch (err) {
        console.error('[SW] Erro ao enfileirar upload:', err);
    }
}

async function processUploadQueue() {
    try {
        const db = await openDatabase();
        const tx = db.transaction('uploads', 'readonly');
        const store = tx.objectStore('uploads');
        const uploads = await store.getAll();
        
        for (const upload of uploads) {
            if (upload.status === 'pending') {
                await uploadFile(upload);
            }
        }
    } catch (err) {
        console.error('[SW] Erro ao processar fila de uploads:', err);
    }
}

async function uploadFile(upload) {
    try {
        const formData = new FormData();
        const blob = new Blob([upload.data], { type: 'application/octet-stream' });
        const file = new File([blob], upload.filename);
        formData.append('files[]', file);
        
        const response = await fetch('/database/upload', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const db = await openDatabase();
            const tx = db.transaction('uploads', 'readwrite');
            const store = tx.objectStore('uploads');
            await store.delete(upload.id);
            console.log('[SW] Upload concluído:', upload.filename);
        } else {
            console.error('[SW] Erro no upload:', response.status);
        }
    } catch (err) {
        console.error('[SW] Erro ao fazer upload:', err);
    }
}

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('DatabaseUploadDB', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('uploads')) {
                db.createObjectStore('uploads', { keyPath: 'id' });
            }
        };
    });
}
