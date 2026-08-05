const VERSION = 'v0.5.0';
const SHELL_CACHE = `fisica-imersiva-360-${VERSION}-shell`;
const LAB_CACHE = `fisica-imersiva-360-${VERSION}-labs`;
const SHELL_FILES = [
  './', './index.html', './manifest.webmanifest',
  './css/styles.css', './css/design-system.css', './css/portal-home.css', './css/student-session.css', './css/pedagogy.css', './css/stability-recovery.css',
  './js/app.js', './js/router.js', './js/storage.js', './js/quality.js', './js/design-system.js', './js/stability.js',
  './js/ui/icons.js', './js/labs/lab-catalog.js',
  './js/labs/route-registry.js', './js/labs/route-resource-manager.js', './js/session/student-session.js',
  './js/modules/home.js', './js/modules/roadmap.js', './js/pedagogy/guided-learning.js', './js/pedagogy/usage-validation.js',
  './js/render/runtime-registry.js', './assets/pedagogy-standard.json',
];

async function cacheShell() {
  const cache = await caches.open(SHELL_CACHE);
  const results = await Promise.allSettled(SHELL_FILES.map(async (url) => {
    const response = await fetch(url, { cache: 'reload' });
    if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
    await cache.put(url, response);
  }));
  const failed = results.filter((result) => result.status === 'rejected');
  if (failed.length) console.warn(`[SW] ${failed.length} arquivo(s) do portal não foram armazenados.`, failed);
}

self.addEventListener('install', (event) => {
  event.waitUntil(cacheShell());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  const valid = new Set([SHELL_CACHE, LAB_CACHE]);
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => !valid.has(key)).map((key) => caches.delete(key)))));
  self.clients.claim();
});

async function navigationResponse(request) {
  try {
    const response = await fetch(request);
    if (response.ok) (await caches.open(SHELL_CACHE)).put('./index.html', response.clone()).catch(() => {});
    return response;
  } catch {
    return (await caches.match('./index.html')) || new Response('Aplicação indisponível offline.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
}

function isShellRequest(url) {
  return SHELL_FILES.some((entry) => {
    if (entry === './') return url.pathname.endsWith('/');
    return url.pathname.endsWith(entry.replace('./', '/'));
  });
}

async function shellResponse(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) (await caches.open(SHELL_CACHE)).put(request, response.clone()).catch(() => {});
  return response;
}

async function demandResponse(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok && new URL(request.url).origin === self.location.origin) {
      (await caches.open(LAB_CACHE)).put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch {
    return new Response('', { status: 503, statusText: 'Recurso do laboratório indisponível offline' });
  }
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (event.request.mode === 'navigate') {
    event.respondWith(navigationResponse(event.request));
    return;
  }
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(isShellRequest(url) ? shellResponse(event.request) : demandResponse(event.request));
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'CLEAR_LAB_CACHE') {
    event.waitUntil(caches.delete(LAB_CACHE).then(() => event.source?.postMessage?.({ type: 'LAB_CACHE_CLEARED' })));
  }
  if (event.data?.type === 'GET_CACHE_STATUS') {
    event.waitUntil(Promise.all([caches.open(SHELL_CACHE), caches.open(LAB_CACHE)]).then(async ([shell, labs]) => {
      const [shellKeys, labKeys] = await Promise.all([shell.keys(), labs.keys()]);
      event.source?.postMessage?.({ type: 'CACHE_STATUS', shellFiles: shellKeys.length, labFiles: labKeys.length });
    }));
  }
});
