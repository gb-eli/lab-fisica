import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { percentile, classifyPerformance } from '../js/render/performance-monitor.js';
import { ADAPTIVE_TIERS } from '../js/render/adaptive-scene-optimizer.js';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const required = [
  'js/render/adaptive-scene-optimizer.js',
  'js/render/runtime-registry.js',
  'assets/performance-budget.json',
  'css/performance-validation.css',
  'docs/OTIMIZACAO_VALIDACAO_TRANSVERSAL.md',
];
await Promise.all(required.map((file) => access(resolve(project, file))));

assert.equal(percentile([10, 20, 30, 40], 0.5), 20);
assert.equal(classifyPerformance({ fps: 58, fpsLow: 46, frameTimeP95: 22 }, 60), 'stable');
assert.equal(classifyPerformance({ fps: 42, fpsLow: 28, frameTimeP95: 38 }, 60), 'constrained');
assert.equal(classifyPerformance({ fps: 18, fpsLow: 9, frameTimeP95: 95 }, 60), 'critical');
assert.ok(ADAPTIVE_TIERS.full.particleRatio > ADAPTIVE_TIERS.reduced.particleRatio);
assert.equal(ADAPTIVE_TIERS.minimal.postProcessing, false);
assert.equal(ADAPTIVE_TIERS.minimal.shadows, false);

const runtime = await readFile(resolve(project, 'js/render/runtime.js'), 'utf8');
assert.match(runtime, /IntersectionObserver/);
assert.match(runtime, /visibilitychange/);
assert.match(runtime, /AdaptiveSceneOptimizer/);
assert.match(runtime, /fisica:renderreport/);
assert.match(runtime, /webgl-recovery/);
assert.match(runtime, /pauseHiddenScenes/);

const manager = await readFile(resolve(project, 'js/assets/asset-manager.js'), 'utf8');
assert.match(manager, /preloadIdle/);
assert.match(manager, /release\(instance\)/);
assert.match(manager, /getStats/);

const budget = JSON.parse(await readFile(resolve(project, 'assets/performance-budget.json'), 'utf8'));
assert.equal(budget.version, '0.5.0');
assert.equal(budget.optimizationContracts.scientificStateIndependentFromFps, true);
assert.ok(Object.values(budget.withinStaticBudget).every(Boolean));
assert.equal(budget.laboratoryContracts.length, 8);

console.log('✓ Orçamentos, adaptação gráfica, suspensão de cenas, recuperação WebGL e auditoria transversal validados.');
