const LOCAL_SOURCE = Object.freeze({ id: 'local', url: '../../vendor/three/three.module.min.js', timeout: 4200, local: true });
const REMOTE_SOURCES = Object.freeze([
  { id: 'jsdelivr', url: 'https://cdn.jsdelivr.net/npm/three@0.184.0/build/three.module.min.js', timeout: 5200 },
  { id: 'unpkg', url: 'https://unpkg.com/three@0.184.0/build/three.module.min.js', timeout: 5200 },
]);
let threePromise;
let lastThreeLoadReport = null;

async function importWithTimeout(url, timeout = 5200) {
  let timer;
  try {
    return await Promise.race([
      import(url),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`Tempo limite ao carregar ${url}`)), timeout); }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

function isValidThree(module) {
  return Boolean(module?.WebGLRenderer && module?.Scene && module?.PerspectiveCamera && module?.REVISION);
}

function sourceList({ allowRemote = true } = {}) {
  return allowRemote ? [LOCAL_SOURCE, ...REMOTE_SOURCES] : [LOCAL_SOURCE];
}

export async function inspectLocalThree() {
  const url = new URL(LOCAL_SOURCE.url, import.meta.url).href;
  try {
    const response = await fetch(url, { method: 'HEAD', cache: 'no-store' });
    return { available: response.ok, status: response.status, url };
  } catch (error) {
    return { available: false, status: 0, url, error: error?.message || String(error) };
  }
}

export async function loadThree(options = {}) {
  const allowRemote = options.allowRemote !== false;
  const cacheKey = allowRemote ? 'local-remote' : 'local-only';
  if (!threePromise || threePromise.cacheKey !== cacheKey) {
    const promise = (async () => {
      const failures = [];
      const startedAt = performance.now();
      for (const source of sourceList({ allowRemote })) {
        const sourceStartedAt = performance.now();
        try {
          const url = source.local ? new URL(source.url, import.meta.url).href : source.url;
          const module = await importWithTimeout(url, source.timeout);
          if (!isValidThree(module)) throw new Error('Módulo Three.js incompleto.');
          lastThreeLoadReport = {
            ready: true,
            source: source.id,
            url,
            revision: String(module.REVISION),
            local: source.local === true,
            loadMs: Math.round(performance.now() - startedAt),
            sourceLoadMs: Math.round(performance.now() - sourceStartedAt),
            allowRemote,
            failures,
          };
          window.dispatchEvent(new CustomEvent('fisica:three-ready', { detail: lastThreeLoadReport }));
          return { THREE: module, source: source.id, url, report: lastThreeLoadReport };
        } catch (error) {
          failures.push({ source: source.id, message: error?.message || String(error), elapsedMs: Math.round(performance.now() - sourceStartedAt) });
        }
      }
      lastThreeLoadReport = { ready: false, source: null, local: false, allowRemote, failures, loadMs: Math.round(performance.now() - startedAt) };
      window.dispatchEvent(new CustomEvent('fisica:three-error', { detail: lastThreeLoadReport }));
      throw new Error(`Three.js indisponível. ${failures.map((item) => `${item.source}: ${item.message}`).join(' | ')}`);
    })().catch((error) => {
      threePromise = undefined;
      throw error;
    });
    promise.cacheKey = cacheKey;
    threePromise = promise;
  }
  return threePromise;
}

export function resetThreeLoader() {
  threePromise = undefined;
  lastThreeLoadReport = null;
}

export function getLastThreeLoadReport() {
  return lastThreeLoadReport ? structuredClone(lastThreeLoadReport) : null;
}

export const threeSources = Object.freeze([LOCAL_SOURCE, ...REMOTE_SOURCES]);
