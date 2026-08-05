import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { R4_PRESETS } from '../js/ui/r4-guided-labs.js';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
for (const path of [
  'js/ui/r4-guided-labs.js',
  'css/r4-reconstructed-labs.css',
  'assets/r4-core-labs.json',
  'docs/RECONSTRUCAO_R4_ONDAS_TERMOFLUIDOS_FISICA_AVANCADA.md',
  'docs/RELATORIO_VALIDACAO_V0.4.4.md',
]) assert.ok(existsSync(new URL(`../${path}`, import.meta.url)), path);

assert.equal(R4_PRESETS.waves.length, 13);
assert.equal(R4_PRESETS.thermal.length, 12);
assert.equal(R4_PRESETS.advanced.length, 10);
for (const presets of Object.values(R4_PRESETS)) for (const preset of presets) {
  assert.equal(preset.steps.length, 3);
  assert.ok(preset.question.length > 20);
  assert.ok(preset.observe.length > 15);
  assert.ok(preset.confidence.length > 12);
  assert.ok(Object.keys(preset.values).length >= 3);
}

const waves = read('js/modules/waves.js');
assert.match(waves, /mountR4Guidance/);
assert.match(waves, /data-waves-restart/);
assert.match(waves, /version:'0\.5\.0'/);

const thermal = read('js/modules/thermal.js');
assert.match(thermal, /mountR4Guidance/);
assert.match(thermal, /data-label="primary"/);
assert.match(thermal, /Temperatura de equilíbrio/);
assert.match(thermal, /version:'0\.5\.0'/);

const advanced = read('js/modules/advanced.js');
assert.match(advanced, /mountR4Guidance/);
assert.match(advanced, /data-advanced-play/);
assert.match(advanced, /data-advanced-restart/);
assert.match(advanced, /running \? params\.speed : 0/);

const advanced3d = read('js/modules/advanced3d.js');
assert.match(advanced3d, /restart:\(\)=>rebuild\(currentMode,true\)/);

const registry = read('js/labs/route-registry.js');
const sw = read('sw.js');
assert.match(registry, /r4-reconstructed-labs\.css/);
assert.doesNotMatch(sw, /r4-guided-labs\.js/);
assert.doesNotMatch(sw, /r4-reconstructed-labs\.css/);
assert.doesNotMatch(sw, /r4-core-labs\.json/);

const contract = JSON.parse(read('assets/r4-core-labs.json'));
assert.equal(contract.version, '0.4.3');
assert.deepEqual(contract.scope, ['waves','thermal','advanced']);
assert.equal(contract.advanced.scientificVsDidacticWarnings, true);
console.log('✓ R4 v0.4.4: cenários, validade do modelo, resultados contextuais, pausa e reinício validados.');
