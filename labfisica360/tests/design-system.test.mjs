import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { moduleThemes } from '../js/design-system.js';
import { icon } from '../js/ui/icons.js';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
await Promise.all([
  access(resolve(project, 'css/design-system.css')),
  access(resolve(project, 'js/design-system.js')),
  access(resolve(project, 'js/ui/icons.js')),
  access(resolve(project, 'docs/DESIGN_SYSTEM_CIENTIFICO.md')),
]);

assert.equal(Object.keys(moduleThemes).length, 11);
assert.equal(moduleThemes.home.kicker, 'Portal Científico');
assert.equal(moduleThemes.ohm.kicker, 'Eletrodinâmica');
assert.equal(moduleThemes.magnetism.kicker, 'Eletromagnetismo');
assert.equal(moduleThemes.energy.kicker, 'Energia e Instalações');
assert.equal(moduleThemes.mechanics.kicker, 'Mecânica e Gravitação');
assert.equal(moduleThemes.waves.kicker, 'Ondas, Acústica e Luz');
assert.equal(moduleThemes.thermal.kicker, 'Termologia e Fluidos');
assert.match(icon('instrument'), /<svg/);
assert.match(icon('instrument'), /<rect/);

const css = await readFile(resolve(project, 'css/design-system.css'), 'utf8');
for (const token of [
  '--material-metal', '--material-glass', '--state-ready', '--state-risk',
  '--module-accent', '--font-technical', '.lab-status-rail', '.instrument-panel',
]) assert.match(css, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));

const index = await readFile(resolve(project, 'index.html'), 'utf8');
assert.match(index, /css\/design-system\.css/);
assert.match(index, /id="density-select"/);
assert.match(index, /id="ui-scale-select"/);
assert.match(index, /id="module-title"/);

console.log('✓ Design system, temas, tokens, ícones e configurações validados.');
