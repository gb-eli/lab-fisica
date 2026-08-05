import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read = (file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8');
const [index, app, registry, manager, sw, home, manifestText] = await Promise.all([
  'index.html','js/app.js','js/labs/route-registry.js','js/labs/route-resource-manager.js','sw.js','js/modules/home.js','assets/module-manifest.json',
].map(read));
const manifest = JSON.parse(manifestText);
const heavyModules = ['hall','coulomb','ohm','magnetism','energy','mechanics','waves','thermal','advanced'];
for (const module of heavyModules) {
  assert.doesNotMatch(app, new RegExp(`from ['\"]\\.\\/modules\\/${module}\\.js`));
  assert.match(registry, new RegExp(`import\\('\\.\\.\\/modules\\/${module}\\.js'\\)`));
}
assert.equal([...index.matchAll(/<link rel="stylesheet"/g)].length, 6);
assert.match(manager, /await definition\.load\(\)/);
assert.match(manager, /loadedStyles\.reverse\(\)\.forEach/);
assert.match(manager, /moduleCleanup/);
assert.match(manager, /activeRuntimes/);
assert.match(sw, /shell-plus-runtime|LAB_CACHE|demandResponse/);
assert.doesNotMatch(sw, /assets\/models\/electrical\/workbench_lod2\.glb/);
assert.match(home, /requestAnimationFrame/);
assert.match(home, /ResizeObserver/);
assert.equal(manifest.strategy, 'hub-lightweight-demand-loaded');
assert.equal(manifest.initial3D, false);
assert.equal(manifest.routes.filter((route) => route.loadPolicy === 'on-navigation').length, 11);
console.log('✓ R8: carregamento inicial leve, módulos/CSS por demanda e liberação de recursos validados.');
