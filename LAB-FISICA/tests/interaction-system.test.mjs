import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CommandHistory } from '../js/interaction/command-history.js';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const files = [
  'js/interaction/command-history.js',
  'js/interaction/snap-system.js',
  'js/interaction/transform-gizmo.js',
  'js/interaction/connection-manager.js',
  'js/interaction/interaction-manager.js',
  'docs/SISTEMA_UNIVERSAL_INTERACAO.md',
];
await Promise.all(files.map((file) => access(resolve(project, file))));

let value = 0;
const reports = [];
const history = new CommandHistory({ onChange: (report) => reports.push(report) });
history.execute({ label: 'Aumentar', do: () => { value += 1; }, undo: () => { value -= 1; } });
assert.equal(value, 1);
assert.equal(history.undo(), true);
assert.equal(value, 0);
assert.equal(history.redo(), true);
assert.equal(value, 1);
assert.equal(reports.at(-1).canUndo, true);

const interaction = await readFile(resolve(project, 'js/interaction/interaction-manager.js'), 'utf8');
const connections = await readFile(resolve(project, 'js/interaction/connection-manager.js'), 'utf8');
const gizmo = await readFile(resolve(project, 'js/interaction/transform-gizmo.js'), 'utf8');
const ohm = await readFile(resolve(project, 'js/modules/ohm.js'), 'utf8');
const cables = await readFile(resolve(project, 'js/render/cables.js'), 'utf8');
const css = await readFile(resolve(project, 'css/electrical-bench.css'), 'utf8');

assert.match(interaction, /raycaster/);
assert.match(interaction, /setEnabled\(false\)/);
assert.match(interaction, /longPressTimer/);
assert.match(interaction, /Ctrl|metaKey/);
assert.match(interaction, /snapSystem/);
assert.match(gizmo, /GIZMO_MOVE_\$\{axis\.toUpperCase\(\)\}/);
assert.match(gizmo, /GIZMO_ROTATE_Y/);
assert.match(connections, /hasElectricalPath/);
assert.match(connections, /selectTerminal/);
assert.match(connections, /createDynamicCableSystem/);
assert.match(cables, /setEndpoints/);
assert.match(ohm, /data-mode="move"/);
assert.match(ohm, /data-mode="rotate"/);
assert.match(ohm, /data-mode="connect"/);
assert.match(ohm, /data-undo/);
assert.match(ohm, /data-redo/);
assert.match(ohm, /saveExperiment\('ohm-layout-v2'/);
assert.match(ohm, /ConnectionManager/);
assert.match(ohm, /SnapSystem/);
assert.match(css, /interaction-toolbar/);
assert.match(css, /history-card/);

console.log('✓ Sistema universal: seleção, gizmo, encaixe, conexões, múltiplas derivações, histórico, teclado e persistência validados.');
