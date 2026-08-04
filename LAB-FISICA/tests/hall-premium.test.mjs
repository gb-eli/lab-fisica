import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const required = [
  'css/hall-premium.css',
  'js/modules/hall.js',
  'js/modules/hall3d.js',
  'js/modules/hall-vignettes.js',
  'js/modules/hall-audio.js',
  'docs/HALL_CIENTIFICO_360_PREMIUM.md',
];
await Promise.all(required.map((file) => access(resolve(project, file))));

const hall = await readFile(resolve(project, 'js/modules/hall.js'), 'utf8');
const catalog = await readFile(resolve(project, 'js/labs/lab-catalog.js'), 'utf8');
const hall3d = await readFile(resolve(project, 'js/modules/hall3d.js'), 'utf8');
const vignettes = await readFile(resolve(project, 'js/modules/hall-vignettes.js'), 'utf8');
const audio = await readFile(resolve(project, 'js/modules/hall-audio.js'), 'utf8');
const controls = await readFile(resolve(project, 'js/render/orbit-controller.js'), 'utf8');
const css = await readFile(resolve(project, 'css/hall-premium.css'), 'utf8');
const index = await readFile(resolve(project, 'index.html'), 'utf8');

assert.match(hall, /Versão 0\.4\.5/);
assert.match(hall, /LAB_CATALOG\.map/);
assert.equal((catalog.match(/route: '[a-z]+'/g) || []).length >= 10, true, 'O catálogo deve manter os laboratórios e rotas do sistema.');
assert.match(hall, /data-hall-map-panel/);
assert.match(hall, /alternativa 2D/i);
assert.match(hall, /data-hall-walk/);
assert.match(hall, /data-hall-audio/);
assert.match(hall, /data-hall-fullscreen/);
assert.match(catalog, /route: 'magnetism'/);
assert.match(catalog, /route: 'waves'/);
assert.match(catalog, /route: 'thermal'/);
assert.doesNotMatch(hall, /Química Avançada|advanced-chemistry/);

assert.match(hall3d, /createArchitecture/);
assert.match(hall3d, /createRoom/);
assert.match(hall3d, /createCoreAndMap/);
assert.match(hall3d, /addElectricalAssetPreview/);
assert.match(hall3d, /AssetManager/);
assert.match(hall3d, /focusSector/);
assert.match(hall3d, /toggleMap/);
assert.match(hall3d, /toggleFullscreen/);
assert.match(hall3d, /createHallAudio/);
assert.match(hall3d, /roomLight\.visible/);
assert.match(hall3d, /profile\.maxDynamicLights/);

for (const factory of ['createCoulomb', 'createCircuit', 'createEnergy', 'createMagnetism', 'createMechanics', 'createWaves', 'createThermal', 'createAdvanced']) {
  assert.match(vignettes, new RegExp(`function ${factory}`));
}
assert.match(audio, /createPanner/);
assert.match(audio, /HRTF/);
assert.match(audio, /updateListener/);
assert.match(controls, /setPose/);
assert.match(controls, /setEnabled/);
assert.match(css, /hall-stage--premium/);
assert.match(css, /hall-map-panel/);
assert.match(css, /hall-sector-brief/);
assert.match(css, /@media \(max-width:620px\)/);
assert.match(index, /css\/hall-premium\.css/);

console.log('✓ Hall Premium: arquitetura, setores, navegação, mapa, áudio, mobile e fallback validados.');
