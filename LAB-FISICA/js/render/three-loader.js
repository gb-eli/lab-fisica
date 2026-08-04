const THREE_SOURCES = Object.freeze([
  { id: 'local', url: '../../vendor/three/three.module.min.js', timeout: 1800 },
  { id: 'jsdelivr', url: 'https://cdn.jsdelivr.net/npm/three@0.184.0/build/three.module.min.js', timeout: 5200 },
  { id: 'unpkg', url: 'https://unpkg.com/three@0.184.0/build/three.module.min.js', timeout: 5200 },
]);
let threePromise;

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

export async function loadThree() {
  if (!threePromise) {
    threePromise = (async () => {
      const failures = [];
      for (const source of THREE_SOURCES) {
        try {
          const url = source.id === 'local' ? new URL(source.url, import.meta.url).href : source.url;
          const module = await importWithTimeout(url, source.timeout);
          if (!isValidThree(module)) throw new Error('Módulo Three.js incompleto.');
          return { THREE: module, source: source.id, url };
        } catch (error) {
          failures.push(`${source.id}: ${error?.message || error}`);
        }
      }
      throw new Error(`Three.js indisponível. ${failures.join(' | ')}`);
    })().catch((error) => {
      threePromise = undefined;
      throw error;
    });
  }
  return threePromise;
}

export function resetThreeLoader() {
  threePromise = undefined;
}

export const threeSources = THREE_SOURCES;
