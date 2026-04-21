/**
 * ARQUIVO: sw.js (NOVO)
 * DESCRIÇÃO: Service Worker com limpeza completa de cache e splash customizado
 * VERSÃO: 4.0.0
 * FEATURE: Limpeza total de cache antigo, sem guardar dados do PWA anterior
 * FEATURE: Suporte a splash screen customizado (React) apenas no PWA
 * FEATURE: Versioning automático com timestamp
 */

// Gera versão única com timestamp para forçar limpeza de cache
const TIMESTAMP = new Date().getTime();
const CACHE_NAME = `suite-cache-v4.1.0-${TIMESTAMP}`;
const CACHE_VERSION_KEY = 'suite_cache_version_4_1';

const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/index',
    '/database',
    '/database/index.html',
    '/database/file_structure.json',
    '/manifest.json',
    '/404.html',
    '/403.html',
    '/429.html',
    '/500.html',
    '/503.html',
    '/callback.html',
    '/pages/login.html',
    '/pages/login',
    '/pages/login/login.css',
    '/pages/login/login-firebase.js',
    '/pages/calendar.html',
    '/pages/calendar',
    '/pages/calendar/calendar.css',
    '/pages/calendar/calendar.js',
    '/pages/suite/suite.css',
    '/pages/suite/suite.js',
    '/pages/suite/santo-do-dia.js',
    '/pages/suite/weather/weather.css',
    '/pages/suite/weather/weather.js',
    '/pages/suite/liturgy.js',
    '/pages/error-pages/error-pages.css',
    '/src/styles/fonts-manager.css',
    '/src/styles/modes.css',
    '/src/app/update.css',
    '/src/app/update.js',
    '/src/app/SplashScreen.jsx',
    '/src/app/SplashScreen.css',
    '/src/js/main/config.js',
    '/src/js/main/env-loader.js',
    '/src/js/main/factory.js',
    '/src/js/main/colors.js',
    '/src/js/main/firebase-config.js',
    '/src/js/main/firebase-sync.js',
    '/database/assets/dev/avatar/avatar.jpg',
    '/database/assets/dev/DATA/calendario.json',
    '/database/assets/dev/templates/dark_mode.jpg',
    '/database/assets/dev/templates/light_mode.jpg',
    '/database/assets/dev/favicon/Favicon.png',
    '/database/assets/dev/favicon/Favicon_R.png',
    '/database/assets/dev/favicon/icon-192.png',
    '/database/assets/dev/favicon/icon-512.png',
    '/database/assets/dev/icons/diversos/WEATHER/Sun.svg',
    '/database/assets/dev/icons/diversos/WEATHER/Moon.svg',
    '/database/assets/dev/TEMPLATES_WEATHER/Weather=Clear, Moment=Day.svg',
    '/database/assets/dev/TEMPLATES_WEATHER/Weather=Clear, Moment=Night.svg',
];

/**
 * INSTALL EVENT
 * Cacheia os arquivos necessários
 */
self.addEventListener('install', (event) => {
    console.log('[SW] 🚀 Instalando Service Worker v4.1.0...');
    console.log('[SW] 📦 Cache name:', CACHE_NAME);
    
    event.waitUntil(
        // Limpa TODOS os caches antigos primeiro
        caches.keys().then((cacheNames) => {
            console.log('[SW] 🧹 Limpando caches antigos...');
            return Promise.all(
                cacheNames.map((cacheName) => {
                    console.log('[SW] ❌ Deletando cache antigo:', cacheName);
                    return caches.delete(cacheName);
                })
            );
        }).then(() => {
            // Cria novo cache
            console.log('[SW] ✅ Criando novo cache:', CACHE_NAME);
            return caches.open(CACHE_NAME);
        }).then((cache) => {
            console.log('[SW] 📥 Adicionando arquivos ao cache...');
            return cache.addAll(ASSETS_TO_CACHE);
        }).then(() => {
            console.log('[SW] ⏭️ Pulando wait...');
            return self.skipWaiting();
        }).catch((error) => {
            console.error('[SW] ❌ Erro durante install:', error);
        })
    );
});

/**
 * ACTIVATE EVENT
 * Limpa caches antigos e reclama clientes
 */
self.addEventListener('activate', (event) => {
    console.log('[SW] 🔄 Ativando Service Worker v4.1.0...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            console.log('[SW] 🔍 Caches encontrados:', cacheNames);
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Remove qualquer cache que não seja o atual
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] 🗑️ Removendo cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[SW] ✅ Todos os caches antigos foram removidos');
            
            // Notifica todos os clientes sobre a atualização
            return self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                    console.log('[SW] 📢 Notificando cliente sobre atualização');
                    client.postMessage({ 
                        type: 'CACHE_UPDATED',
                        version: '4.1.0',
                        timestamp: TIMESTAMP
                    });
                });
            });
        }).then(() => {
            console.log('[SW] 👥 Reclamando clientes...');
            return self.clients.claim();
        }).catch((error) => {
            console.error('[SW] ❌ Erro durante activate:', error);
        })
    );
});

/**
 * MESSAGE EVENT
 * Listener para mensagens do cliente
 */
self.addEventListener('message', (event) => {
    console.log('[SW] 💬 Mensagem recebida:', event.data);
    
    if (event.data === 'SKIP_WAITING') {
        console.log('[SW] ⏭️ SKIP_WAITING solicitado');
        self.skipWaiting();
    }
    
    if (event.data === 'CLEAR_ALL_CACHE') {
        console.log('[SW] 🧹 Limpeza completa de cache solicitada');
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    console.log('[SW] ❌ Deletando:', cacheName);
                    return caches.delete(cacheName);
                })
            );
        }).then(() => {
            console.log('[SW] ✅ Cache completamente limpo');
            event.ports[0].postMessage({ success: true });
        });
    }
});

/**
 * FETCH EVENT
 * Estratégia: Cache First, Network Fallback
 */
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // ❌ NÃO CACHEAR: Google, APIs externas, OAuth
    if (url.hostname.includes('accounts.google.com') || 
        url.hostname.includes('googleapis.com') || 
        url.hostname.includes('gstatic.com') ||
        url.pathname.includes('callback.html') ||
        url.hostname.includes('api.weatherapi.com')) {
        console.log('[SW] 🌐 Pulando cache para:', url.hostname);
        return;
    }

    // ❌ NÃO CACHEAR: Requisições de outro domínio
    if (url.origin !== self.location.origin) {
        console.log('[SW] 🚫 Origem diferente:', url.origin);
        return;
    }

    // ✅ CACHEAR: Requisições do mesmo domínio
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Se tem no cache, retorna do cache
            if (cachedResponse) {
                console.log('[SW] 💾 Servindo do cache:', url.pathname);
                return cachedResponse;
            }

            // Se não tem no cache, tenta buscar da rede
            return fetch(event.request).then((networkResponse) => {
                // Se for 404 e for navegação, tenta .html fallback
                if (networkResponse.status === 404 && event.request.mode === 'navigate') {
                    const cleanPath = url.pathname.endsWith('/') ? url.pathname.slice(0, -1) : url.pathname;
                    
                    if (!cleanPath.endsWith('.html')) {
                        // Tenta primeiro o arquivo .html (ex: /pages/calendar -> /pages/calendar.html)
                        return caches.match(cleanPath + '.html').then(htmlCached => {
                            if (htmlCached) {
                                console.log('[SW] 📄 Usando .html fallback do cache:', cleanPath);
                                return htmlCached;
                            }
                            
                            // Se não achar .html, tenta index.html dentro da pasta (ex: /database -> /database/index.html)
                            const indexPath = cleanPath.endsWith('/') ? cleanPath + 'index.html' : cleanPath + '/index.html';
                            return caches.match(indexPath).then(indexCached => {
                                if (indexCached) {
                                    console.log('[SW] 📂 Usando index.html fallback do cache:', indexPath);
                                    return indexCached;
                                }

                                // Se não estiver no cache, tenta buscar da rede
                                return fetch(cleanPath + '.html').then(htmlNet => {
                                    if (htmlNet.ok) return htmlNet;
                                    return fetch(indexPath).then(indexNet => {
                                        if (indexNet.ok) return indexNet;
                                        return caches.match('/404.html');
                                    }).catch(() => caches.match('/404.html'));
                                }).catch(() => caches.match('/404.html'));
                            });
                        });
                    }
                    return caches.match('/404.html');
                }
                
                console.log('[SW] 🌐 Servindo da rede:', url.pathname);
                return networkResponse;
            }).catch(() => {
                // Se falhar, tenta cache como fallback
                console.log('[SW] ⚠️ Erro na rede, tentando cache:', url.pathname);
                if (event.request.mode === 'navigate') {
                    const cleanPath = url.pathname.endsWith('/') ? url.pathname.slice(0, -1) : url.pathname;
                    return caches.match(cleanPath + '.html') || caches.match('/404.html') || caches.match('/index.html');
                }
            });
        })
    );
});

console.log('[SW] ✅ Service Worker v4.1.0 carregado');
