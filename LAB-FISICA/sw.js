const CACHE = 'fisica-imersiva-360-v0.4.5';
const CORE_FILES = [
  './','./index.html','./manifest.webmanifest',
  './css/styles.css','./css/design-system.css','./css/electrical-bench.css','./css/hall-premium.css','./css/magnetism-lab.css','./css/energy-lab.css','./css/mechanics-lab.css','./css/waves-lab.css','./css/thermal-lab.css','./css/advanced-lab.css','./css/performance-validation.css','./css/artistic-refinement.css','./css/device-validation.css','./css/pedagogy.css','./css/stability-recovery.css','./css/experience-workspace.css','./css/r2-core-labs.css','./css/r3-reconstructed-labs.css','./css/r4-reconstructed-labs.css',
  './js/app.js','./js/router.js','./js/stability.js','./js/storage.js','./js/quality.js','./js/diagnostics.js','./js/device-validation.js','./js/pedagogy/guided-learning.js','./js/pedagogy/usage-validation.js','./js/design-system.js','./js/ui/icons.js','./js/labs/lab-catalog.js','./js/ui/experience-workspace.js','./js/ui/r3-guided-labs.js','./js/ui/r4-guided-labs.js',
  './js/render/three-loader.js','./js/render/webgl-preflight.js','./js/render/render-watchdog.js','./js/render/runtime.js','./js/render/artistic-refinement.js','./js/render/orbit-controller.js','./js/render/environment.js','./js/render/materials.js','./js/render/postfx.js','./js/render/performance-monitor.js','./js/render/adaptive-scene-optimizer.js','./js/render/runtime-registry.js','./js/render/dispose.js','./js/render/cables.js',
  './js/interaction/command-history.js','./js/interaction/snap-system.js','./js/interaction/transform-gizmo.js','./js/interaction/connection-manager.js','./js/interaction/interaction-manager.js',
  './js/assets/glb-loader-lite.js','./js/assets/asset-manager.js','./js/assets/texture-library.js','./js/assets/procedural-fallbacks.js',
  './js/science/electrostatics.js','./js/science/electrical-instruments.js','./js/science/resistive-network.js','./js/science/electromagnetism.js','./js/science/energy-grid.js','./js/science/mechanics.js','./js/science/waves-optics.js','./js/science/thermodynamics-fluids.js','./js/science/advanced-physics.js',
  './js/modules/hall.js','./js/modules/hall3d.js','./js/modules/hall-audio.js','./js/modules/hall-vignettes.js','./js/modules/coulomb.js','./js/modules/coulomb3d.js','./js/modules/ohm.js','./js/modules/magnetism.js','./js/modules/magnetism3d.js','./js/modules/energy.js','./js/modules/energy3d.js','./js/modules/mechanics.js','./js/modules/mechanics3d.js','./js/modules/waves.js','./js/modules/waves3d.js','./js/modules/thermal.js','./js/modules/thermal3d.js','./js/modules/roadmap.js','./js/modules/advanced.js','./js/modules/advanced3d.js',
  './assets/manifest.json','./assets/graphics-standard.json','./assets/r6-webgl-pilot.json','./assets/performance-budget.json','./assets/pedagogy-standard.json','./assets/ux-audit.json','./assets/r3-core-labs.json','./assets/r4-core-labs.json','./assets/r5-playtest.json','./assets/models/electrical/manifest.json','./assets/models/electrical/asset-checksums.json',
  './assets/models/electrical/workbench_lod2.glb','./assets/models/electrical/power_supply_lod2.glb','./assets/models/electrical/multimeter_lod2.glb','./assets/models/electrical/resistor_module_lod2.glb','./assets/models/electrical/toggle_switch_lod2.glb','./assets/models/electrical/lamp_load_lod2.glb','./assets/models/electrical/ammeter_lod2.glb','./assets/models/electrical/voltmeter_lod2.glb','./assets/models/electrical/fuse_module_lod2.glb','./assets/models/electrical/rheostat_lod2.glb','./assets/models/electrical/diode_module_lod2.glb','./assets/models/electrical/led_module_lod2.glb',
  './assets/textures/pbr/brushed-metal_basecolor.png','./assets/textures/pbr/brushed-metal_roughness.png','./assets/textures/pbr/brushed-metal_normal.png','./assets/textures/pbr/rubber_basecolor.png','./assets/textures/pbr/rubber_roughness.png','./assets/textures/pbr/rubber_normal.png','./assets/textures/pbr/ceramic_basecolor.png','./assets/textures/pbr/ceramic_roughness.png','./assets/textures/pbr/ceramic_normal.png','./assets/textures/pbr/bench-top_basecolor.png','./assets/textures/pbr/bench-top_roughness.png','./assets/textures/pbr/bench-top_normal.png',
];

async function cacheIndividually() {
  const cache = await caches.open(CACHE);
  const results = await Promise.allSettled(CORE_FILES.map(async (url) => {
    const response = await fetch(url, { cache: 'reload' });
    if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
    await cache.put(url, response);
  }));
  const failed = results.filter((result) => result.status === 'rejected');
  if (failed.length) console.warn(`[SW] ${failed.length} arquivo(s) não foram pré-armazenados.`, failed);
}

self.addEventListener('install', (event) => {
  event.waitUntil(cacheIndividually());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))));
  self.clients.claim();
});

async function navigationResponse(request) {
  try {
    const response = await fetch(request);
    if (response.ok) (await caches.open(CACHE)).put('./index.html', response.clone()).catch(() => {});
    return response;
  } catch {
    return (await caches.match('./index.html')) || new Response('Aplicação indisponível offline.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
}

async function assetResponse(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok && new URL(request.url).origin === self.location.origin) {
      (await caches.open(CACHE)).put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch {
    return new Response('', { status: 503, statusText: 'Asset indisponível offline' });
  }
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (event.request.mode === 'navigate') event.respondWith(navigationResponse(event.request));
  else event.respondWith(assetResponse(event.request));
});
