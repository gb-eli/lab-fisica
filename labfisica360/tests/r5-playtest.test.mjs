import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const required = [
  'assets/r5-playtest.json',
  'validation/r5-browser-smoke.json',
  'tools/browser_smoke_test.py',
  'docs/FECHAMENTO_RECONSTRUCAO_R5.md',
  'docs/RELATORIO_VALIDACAO_V0.4.4.md',
];
for (const path of required) assert.ok(existsSync(new URL(`../${path}`, import.meta.url)), path);

for (const module of ['waves','thermal','mechanics']) {
  const source = read(`js/modules/${module}.js`);
  assert.match(source, /disposed=false/, `${module} precisa declarar disposed antes do cleanup.`);
}
const workspace = read('css/experience-workspace.css');
assert.match(workspace, /as visualizações ocupam uma linha própria/);
assert.match(workspace, /grid-column:1 \/ -1/);
const pedagogy = read('css/pedagogy.css');
assert.match(pedagogy, /guided-hud \{ display:none !important; \}/);
const router = read('js/router.js');
assert.match(router, /fisica:route-ready/);
assert.match(router, /Falha ao organizar a interface/);
assert.match(router, /window\.scrollTo\(0, 0\)/);
const app = read('js/app.js');
assert.match(app, /fisica:app-ready/);
assert.match(app, /dataset\.currentRoute/);

const report = JSON.parse(read('validation/r5-browser-smoke.json'));
assert.equal(report.version, '0.4.4');
assert.equal(report.passed, true);
assert.equal(report.profiles.length, 2);
for (const profile of report.profiles) {
  assert.equal(profile.passed, true, profile.profile);
  assert.equal(profile.routes.length, 10);
  assert.equal(profile.runtimeMessages.length, 0);
  assert.ok(profile.routes.filter((route) => route.restartClicked).length >= 6, `${profile.profile}: reinícios visíveis insuficientes`);
  for (const route of profile.routes) {
    assert.equal(route.routeErrorCount, 0, `${profile.profile}:${route.route}`);
    assert.equal(route.horizontalOverflow.length, 0, `${profile.profile}:${route.route}`);
  }
}
const contract = JSON.parse(read('assets/r5-playtest.json'));
assert.equal(contract.version, '0.4.4');
assert.equal(contract.fixed.length, 10);
console.log('✓ R5 v0.4.4: rotas, controles, limpeza, desktop e mobile validados em navegador no modo seguro 2D.');
