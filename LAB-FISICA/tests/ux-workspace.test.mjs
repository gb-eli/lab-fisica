import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LAB_CATALOG, LAB_BY_ROUTE, getLearningPath } from '../js/labs/lab-catalog.js';
import { experienceRouteLayout } from '../js/ui/experience-workspace.js';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const required = [
  'js/labs/lab-catalog.js','js/ui/experience-workspace.js','css/experience-workspace.css',
  'assets/ux-audit.json','tools/audit_ux_structure.mjs',
];
await Promise.all(required.map((file) => access(resolve(project, file))));

const routes = ['coulomb','ohm','magnetism','energy','mechanics','waves','thermal','advanced'];
assert.equal(LAB_CATALOG.length, 8);
assert.deepEqual(getLearningPath().map((lab) => lab.route), routes);
assert.equal(new Set(LAB_CATALOG.map((lab) => lab.order)).size, 8);
for (const route of routes) {
  const lab = LAB_BY_ROUTE[route];
  assert.ok(lab, `Metadados ausentes para ${route}`);
  assert.ok(lab.objective.length > 30);
  assert.equal(lab.steps.length, 3);
  assert.ok(lab.controls.length > 20);
  assert.ok(experienceRouteLayout[route], `Layout comum ausente para ${route}`);
}

const [index, app, storage, workspace, css, roadmap, hall, manifestText] = await Promise.all([
  'index.html','js/app.js','js/storage.js','js/ui/experience-workspace.js','css/experience-workspace.css',
  'js/modules/roadmap.js','js/modules/hall.js','assets/manifest.json',
].map((file) => readFile(resolve(project, file), 'utf8')));
assert.match(index, /css\/experience-workspace\.css/);
assert.match(index, /id="experience-mode-select"/);
assert.doesNotMatch(index, /id="tutorial-auto-start"[^>]*checked/);
assert.match(app, /mountExperienceWorkspace/);
assert.match(app, /experience-guided/);
assert.match(storage, /settings\.v10/);
assert.match(storage, /experienceMode:\s*'guided'/);
for (const label of ['Laboratório','Cena','Controles','Resultados','Apoio']) assert.match(workspace, new RegExp(label));
assert.match(workspace, /MutationObserver/);
assert.match(workspace, /data-experience-scenario-slot/);
assert.match(css, /data-experience-view="scene"/);
assert.match(css, /@media \(max-width:\s*820px\)/);
assert.match(css, /data-experience-mode="guided"/);
assert.match(roadmap, /getLearningPath/);
assert.match(roadmap, /learningQuestion/);
assert.match(hall, /LAB_CATALOG\.map/);
const manifest = JSON.parse(manifestText);
assert.equal(manifest.version, '0.4.5');
assert.equal(manifest.groups['ux-ui-reorganization'].status, 'functional-shared-workspace');

const audit = JSON.parse(await readFile(resolve(project, 'assets/ux-audit.json'), 'utf8'));
assert.equal(audit.version, '0.4.5');
assert.equal(Object.keys(audit.modules).length, 9);
assert.ok(audit.totals.templateInputs > 100);
assert.ok(audit.findings.some((finding) => finding.status === 'fixed-central-lab-catalog'));
assert.ok(audit.findings.some((finding) => finding.status === 'fixed-shared-experience-workspace'));
console.log('✓ UX/UI v0.4.1: catálogo único, workspace, progressão guiada, mobile e auditoria estrutural validados.');
