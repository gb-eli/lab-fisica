import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const required = ['js/stability.js','css/stability-recovery.css','docs/AUDITORIA_RECUPERACAO_ESTRUTURAL_V0.3.9.md','docs/RELATORIO_VALIDACAO_V0.3.9.md'];
await Promise.all(required.map((file) => access(resolve(project, file))));
const [index, app, runtime, loader, router, sw, roadmap, stability, catalog] = await Promise.all([
  'index.html','js/app.js','js/render/runtime.js','js/render/three-loader.js','js/router.js','sw.js','js/modules/roadmap.js','js/stability.js','js/labs/lab-catalog.js',
].map((file) => readFile(resolve(project, file), 'utf8')));

const dockRoutes = [...index.matchAll(/data-route="([^"]+)"/g)].map((match) => match[1]);
assert.deepEqual(dockRoutes, ['hall','coulomb','ohm','roadmap'], 'O dock deve conter somente as decisões principais, além do botão de progresso.');
assert.match(index, /id="dock-progress"/);
assert.match(index, /id="force-2d"/);
assert.match(app, /renderRoadmap\(root, \{ navigate:/);
assert.match(app, /createStabilityCenter/);
assert.match(app, /renderRouteBrief/);
assert.match(app, /finally\s*\{/);
assert.match(runtime, /runWebGLPreflight/);
assert.match(runtime, /webgl/);
assert.match(runtime, /force2d/);
assert.match(loader, /cdn\.jsdelivr\.net/);
assert.match(loader, /unpkg\.com/);
assert.match(router, /hashchange/);
assert.match(router, /navigationId/);
assert.match(router, /runCleanup/);
assert.match(sw, /Promise\.allSettled/);
assert.doesNotMatch(sw, /catch\(\(\) => caches\.match\('\.\/index\.html'\)\)/, 'Assets não podem receber HTML como fallback.');
for (const route of ['coulomb','ohm','magnetism','energy','mechanics','waves','thermal','advanced']) {
  assert.match(catalog, new RegExp(`route: '${route}'`));
  assert.match(stability, /ROUTE_META/);
}
for (const file of ['advanced','energy','magnetism','mechanics','thermal','waves','hall']) {
  const source = await readFile(resolve(project, `js/modules/${file}.js`), 'utf8');
  assert.match(source, /\.catch\(/, `${file} precisa tratar falha da montagem 3D.`);
}
console.log('✓ Recuperação estrutural: navegação, modo 2D, erros 3D, roteador e cache offline validados.');
