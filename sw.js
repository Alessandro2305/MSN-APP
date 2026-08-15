const CACHE_NAME = 'windows-live-2026-v1';

const APP_FILES = [
    './',
    './index.html',
    './cadastro.html',

    './style.css',
    './cadastro.css',
    './script.js',

    './manifest.json',

    './imagem/icon-192.png',
    './imagem/icon-512.png',

    './img/logo.png',
    './img/icone.png',
    './img/logo00.png',
    './img/logomsn.png'
];


/* ==========================================
   INSTALAÇÃO
   ========================================== */

self.addEventListener('install', event => {

    console.log('[SW] Instalando Windows Live 2026...');

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {

                console.log('[SW] Salvando arquivos no cache...');

                return cache.addAll(APP_FILES);

            })
            .then(() => {

                console.log('[SW] Cache criado com sucesso.');

                return self.skipWaiting();

            })

    );

});


/* ==========================================
   ATIVAÇÃO
   ========================================== */

self.addEventListener('activate', event => {

    event.waitUntil(

        caches.keys()
            .then(cacheNames => {

                return Promise.all(

                    cacheNames
                        .filter(cacheName => cacheName !== CACHE_NAME)
                        .map(cacheName => {

                            console.log(
                                '[SW] Removendo cache antigo:',
                                cacheName
                            );

                            return caches.delete(cacheName);

                        })

                );

            })
            .then(() => {

                console.log('[SW] Service Worker ativado.');

                return self.clients.claim();

            })

    );

});


/* ==========================================
   BUSCA DE ARQUIVOS
   ========================================== */

self.addEventListener('fetch', event => {

    /*
     * Ignora requisições que não sejam GET.
     */

    if (event.request.method !== 'GET') {
        return;
    }


    /*
     * Não tenta controlar requisições externas.
     *
     * Exemplo:
     * Font Awesome
     * APIs
     * outros sites
     */

    const requestURL = new URL(event.request.url);

    if (requestURL.origin !== self.location.origin) {
        return;
    }


    event.respondWith(

        fetch(event.request)

            .then(response => {

                /*
                 * Se a resposta for válida,
                 * salva uma cópia no cache.
                 */

                if (
                    response &&
                    response.status === 200 &&
                    response.type === 'basic'
                ) {

                    const responseClone = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {

                            cache.put(
                                event.request,
                                responseClone
                            );

                        });

                }

                return response;

            })

            .catch(() => {

                /*
                 * Se estiver sem internet,
                 * tenta carregar pelo cache.
                 */

                return caches.match(event.request)
                    .then(cachedResponse => {

                        if (cachedResponse) {
                            return cachedResponse;
                        }


                        /*
                         * Se for uma página e não estiver
                         * no cache, abre o index.
                         */

                        if (event.request.mode === 'navigate') {

                            return caches.match('./index.html');

                        }

                    });

            })

    );

});