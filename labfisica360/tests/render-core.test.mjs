import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const renderFiles = [
  'js/render/runtime.js', 'js/render/three-loader.js', 'js/render/orbit-controller.js',
  'js/render/environment.js', 'js/render/materials.js', 'js/render/postfx.js',
  'js/render/performance-monitor.js', 'js/render/adaptive-scene-optimizer.js',
  'js/render/runtime-registry.js', 'js/render/artistic-refinement.js', 'js/render/dispose.js',
];
await Promise.all(renderFiles.map((file) => access(resolve(project, file))));

const runtime = await readFile(resolve(project, 'js/render/runtime.js'), 'utf8');
assert.match(runtime, /webglcontextlost/);
assert.match(runtime, /webglcontextrestored/);
assert.match(runtime, /PerformanceMonitor/);
assert.match(runtime, /LightweightPostFX/);
assert.match(runtime, /createProceduralEnvironment/);
assert.match(runtime, /disposeObject3D/);
assert.match(runtime, /AdaptiveSceneOptimizer/);
assert.match(runtime, /IntersectionObserver/);
assert.match(runtime, /visibilitychange/);
assert.match(runtime, /registerRuntime/);
assert.match(runtime, /createArtisticRefinement/);
assert.match(runtime, /bindCameraController/);

const hall = await readFile(resolve(project, 'js/modules/hall3d.js'), 'utf8');
const advanced = await readFile(resolve(project, 'js/modules/advanced3d.js'), 'utf8');
const magnetism = await readFile(resolve(project, 'js/modules/magnetism3d.js'), 'utf8');
for (const source of [hall, advanced, magnetism]) {
  assert.match(source, /createRenderRuntime/);
  assert.match(source, /createOrbitController/);
  assert.doesNotMatch(source, /new THREE\.WebGLRenderer/);
  assert.doesNotMatch(source, /cdn\.jsdelivr/);
}

const loader = await readFile(resolve(project, 'js/render/three-loader.js'), 'utf8');
assert.match(loader, /vendor\/three\/three\.module\.min\.js/);
assert.match(loader, /three@0\.184\.0/);

const index = await readFile(resolve(project, 'index.html'), 'utf8');
assert.match(index, /id="dynamic-resolution"/);
assert.match(index, /id="post-processing"/);
assert.match(index, /id="show-performance"/);
assert.match(index, /id="adaptive-quality"/);
assert.match(index, /id="pause-hidden-scenes"/);
assert.match(index, /id="run-render-audit"/);
assert.match(index, /id="camera-assist"/);

console.log('✓ Núcleo compartilhado, pós-processamento, métricas e recuperação WebGL validados.');
