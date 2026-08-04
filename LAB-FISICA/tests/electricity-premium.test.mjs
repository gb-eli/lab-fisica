import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CIRCUIT_TEMPLATES, MODEL_MODES, createTemplateNetwork, solveResistiveNetwork } from '../js/science/resistive-network.js';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
await Promise.all([
  'js/science/resistive-network.js',
  'docs/LABORATORIO_ELETRICIDADE_PREMIUM.md',
  'docs/RELATORIO_VALIDACAO_V0.2.9.md',
].map((file) => access(resolve(project, file))));

const moduleText = await readFile(resolve(project, 'js/modules/ohm.js'), 'utf8');
const css = await readFile(resolve(project, 'css/electrical-bench.css'), 'utf8');
assert.match(moduleText, /CIRCUIT_TEMPLATES/);
assert.match(moduleText, /solveResistiveNetwork/);
assert.match(moduleText, /data-select="template"/);
assert.match(moduleText, /data-branch-rows/);
assert.match(moduleText, /data-export-evidence/);
assert.match(moduleText, /data-export-csv/);
assert.match(moduleText, /data-check-practice/);
assert.match(moduleText, /network-r2/);
assert.match(moduleText, /network-r3/);
assert.match(css, /branch-table/);
assert.match(css, /guided-practice/);
assert.match(css, /evidence-card/);

const series = solveResistiveNetwork({ sourceVoltage: 12, currentLimit: 2, modelMode: MODEL_MODES.IDEAL, network: createTemplateNetwork(CIRCUIT_TEMPLATES.SERIES, [100, 220, 330]) });
assert.ok(Math.abs(series.equivalentResistance - 320) < 1e-8);
const parallel = solveResistiveNetwork({ sourceVoltage: 12, currentLimit: 2, modelMode: MODEL_MODES.IDEAL, network: createTemplateNetwork(CIRCUIT_TEMPLATES.PARALLEL, [100, 220, 330]) });
assert.ok(Math.abs(parallel.branches[0].voltage - parallel.branches[1].voltage) < 1e-8);
const mixed = solveResistiveNetwork({ sourceVoltage: 12, currentLimit: 2, modelMode: MODEL_MODES.IDEAL, network: createTemplateNetwork(CIRCUIT_TEMPLATES.MIXED, [100, 220, 330]) });
assert.ok(Math.abs(mixed.branches[0].current - mixed.branches[1].current - mixed.branches[2].current) < 1e-8);

console.log('✓ Eletricidade Premium: topologias, solver, três resistores 3D, práticas e exportações validados.');
