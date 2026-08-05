import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const required = [
  'css/magnetism-lab.css',
  'js/science/electromagnetism.js',
  'js/modules/magnetism.js',
  'js/modules/magnetism3d.js',
  'docs/ELETROMAGNETISMO_ENERGIA_PREMIUM_360.md',
  'docs/RELATORIO_VALIDACAO_V0.3.0.md',
];
await Promise.all(required.map((file) => access(resolve(project, file))));
const moduleText = await readFile(resolve(project, 'js/modules/magnetism.js'), 'utf8');
const sceneText = await readFile(resolve(project, 'js/modules/magnetism3d.js'), 'utf8');
const css = await readFile(resolve(project, 'css/magnetism-lab.css'), 'utf8');
const registry = await readFile(resolve(project, 'js/labs/route-registry.js'), 'utf8');
const hall = await readFile(resolve(project, 'js/modules/hall.js'), 'utf8');
const catalog = await readFile(resolve(project, 'js/labs/lab-catalog.js'), 'utf8');

for (const mode of ['magnets', 'solenoid', 'induction', 'motor', 'generator', 'transformer']) {
  assert.match(moduleText, new RegExp(`${mode}:`), `Modo ${mode} precisa existir.`);
}
assert.match(moduleText, /data-mag-stage/);
assert.match(moduleText, /data-mag-export/);
assert.match(moduleText, /data-mag-practice/);
assert.match(moduleText, /Linhas de campo/);
assert.match(moduleText, /Limalha virtual/);
assert.match(sceneText, /createBarMagnet/);
assert.match(sceneText, /createIronFilings/);
assert.match(sceneText, /createSolenoidMode/);
assert.match(sceneText, /createInductionMode/);
assert.match(sceneText, /createMotorMode/);
assert.match(sceneText, /createTransformerMode/);
assert.match(sceneText, /createRenderRuntime/);
assert.match(sceneText, /createOrbitController/);
assert.match(css, /magnetism-stage/);
assert.match(css, /@media\(max-width:760px\)/);
assert.match(registry, /renderMagnetism/);
assert.match(registry, /magnetism-lab\.css/);
assert.match(registry, /import\('\.\.\/modules\/magnetism\.js'\)/);
assert.match(catalog, /route: 'magnetism'/);
assert.match(hall, /Versão 0\.5\.0/);

console.log('✓ Laboratório de Eletromagnetismo Premium: seis experiências, 3D/360°, mobile, evidência e Hall validados.');
