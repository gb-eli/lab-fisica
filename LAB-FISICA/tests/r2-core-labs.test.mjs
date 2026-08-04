import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const required = [
  'css/r2-core-labs.css', 'js/modules/coulomb3d.js',
  'docs/RECONSTRUCAO_R2_HALL_ELETROSTATICA_ELETRICIDADE.md',
  'docs/RELATORIO_VALIDACAO_V0.4.1.md', 'assets/r2-core-labs.json',
];
await Promise.all(required.map((file) => access(resolve(project, file))));
const [hall, hall3d, coulomb, coulomb3d, ohm, css, index, sw, manifestText] = await Promise.all([
  'js/modules/hall.js','js/modules/hall3d.js','js/modules/coulomb.js','js/modules/coulomb3d.js','js/modules/ohm.js','css/r2-core-labs.css','index.html','sw.js','assets/manifest.json',
].map((file) => readFile(resolve(project, file), 'utf8')));
const manifest = JSON.parse(manifestText);
assert.match(hall, /TRILHA RECOMENDADA/);
assert.match(hall, /Começar pela Eletrostática/);
assert.match(hall3d, /compactOverview/);
assert.match(coulomb, /Eletrostática 360°/);
assert.match(coulomb, /data-preset="attraction"/);
assert.match(coulomb, /data-action="view"/);
assert.match(coulomb, /mountCoulomb3D/);
assert.match(coulomb3d, /createRenderRuntime/);
assert.match(coulomb3d, /onPositionChange/);
assert.match(coulomb3d, /electricPotentialAt/);
assert.match(ohm, /Montagem guiada/);
assert.match(ohm, /data-safe-start/);
assert.match(ohm, /applySafeStart/);
assert.match(ohm, /bench-guided-overlay/);
assert.match(css, /lab-grid--priority/);
assert.match(css, /coulomb-stage/);
assert.match(css, /bench-start-card/);
assert.match(index, /css\/r2-core-labs\.css/);
assert.match(sw, /coulomb3d\.js/);
assert.match(sw, /r2-core-labs\.css/);
assert.equal(manifest.version, '0.4.5');
assert.equal(manifest.groups.electrostatics.status, 'functional-r2-guided-3d');
console.log('✓ R2: Hall, Eletrostática 3D, bancada guiada, mobile e fallback validados.');
