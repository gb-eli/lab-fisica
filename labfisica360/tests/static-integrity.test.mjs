import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const required = [
  'index.html','sw.js','manifest.webmanifest','package.json','assets/manifest.json','assets/module-manifest.json',
  'css/styles.css','css/design-system.css','css/portal-home.css','css/student-session.css','css/pedagogy.css','css/stability-recovery.css',
  'js/app.js','js/router.js','js/storage.js','js/design-system.js','js/labs/lab-catalog.js','js/labs/route-registry.js',
  'js/labs/route-resource-manager.js','js/session/student-session.js','js/modules/home.js','js/modules/roadmap.js',
  'js/mentors/mentor-controller.js','js/mentors/mentor-catalog.js','js/mentors/tracks/core-tracks.js','js/mentors/highlight-engine.js','js/mentors/step-validator.js','css/mentor-guided.css','assets/r9-mentor-guided.json',
  'js/modules/hall.js','js/modules/hall3d.js','js/modules/coulomb.js','js/modules/coulomb3d.js','js/modules/ohm.js',
  'js/modules/magnetism.js','js/modules/magnetism3d.js','js/modules/energy.js','js/modules/energy3d.js',
  'js/modules/mechanics.js','js/modules/mechanics3d.js','js/modules/waves.js','js/modules/waves3d.js',
  'js/modules/thermal.js','js/modules/thermal3d.js','js/modules/advanced.js','js/modules/advanced3d.js',
  'js/render/runtime.js','js/render/runtime-registry.js','js/render/three-loader.js','js/assets/asset-manager.js',
  'assets/models/electrical/manifest.json','assets/models/electrical/asset-checksums.json',
];
await Promise.all(required.map((file) => access(resolve(project, file))));

const read = (file) => readFile(resolve(project, file), 'utf8');
const [index, app, registry, manager, session, home, sw, router, hall, catalog, manifestText, moduleManifestText] = await Promise.all([
  'index.html','js/app.js','js/labs/route-registry.js','js/labs/route-resource-manager.js','js/session/student-session.js',
  'js/modules/home.js','sw.js','js/router.js','js/modules/hall.js','js/labs/lab-catalog.js','assets/manifest.json','assets/module-manifest.json',
].map(read));

for (const route of ['home','roadmap','hall','coulomb','ohm','magnetism','energy','mechanics','waves','thermal','advanced']) {
  assert.match(registry, new RegExp(`\\b${route}:\\s*\\{`), `Rota ${route} ausente do registro modular.`);
}
for (const [route, module] of Object.entries({
  hall:'hall',coulomb:'coulomb',ohm:'ohm',magnetism:'magnetism',energy:'energy',mechanics:'mechanics',waves:'waves',thermal:'thermal',advanced:'advanced',
})) {
  assert.match(registry, new RegExp(`import\\('\\.\\.\\/modules\\/${module}\\.js'\\)`), `Módulo ${route} precisa ser importado dinamicamente.`);
  assert.doesNotMatch(app, new RegExp(`from ['\"]\\.\\/modules\\/${module}\\.js`), `Módulo ${route} não pode ser importado estaticamente no app.`);
}

const initialStyles = [...index.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((match) => match[1]);
assert.deepEqual(initialStyles, [
  'css/styles.css','css/design-system.css','css/portal-home.css','css/student-session.css','css/pedagogy.css','css/stability-recovery.css',
]);
for (const heavyStyle of ['electrical-bench.css','hall-premium.css','magnetism-lab.css','energy-lab.css','mechanics-lab.css','waves-lab.css','thermal-lab.css','advanced-lab.css','experience-workspace.css']) {
  assert.equal(initialStyles.some((style) => style.includes(heavyStyle)), false, `${heavyStyle} não pode carregar na tela inicial.`);
  assert.match(registry, new RegExp(heavyStyle.replace('.', '\\.') + ''), `${heavyStyle} deve estar no registro sob demanda.`);
}

assert.match(index, /data-route="home"/);
assert.match(index, /id="btn-student-session"/);
assert.match(index, /id="student-name"/);
assert.match(index, /id="student-class"/);
assert.match(index, /id="student-shift"/);
assert.match(index, /id="export-session-json"/);
assert.match(index, /id="export-session-csv"/);
assert.match(home, /createPhysicsBackdrop/);
assert.match(home, /0[^\n]*cenas 3D no início/);
assert.match(home, /data-open-lab/);
assert.match(home, /Hall 3D opcional/);

assert.match(manager, /definition\.load\(\)/);
assert.match(manager, /releaseStyle/);
assert.match(manager, /fisica:lab-unload/);
assert.match(manager, /getRuntimeSnapshot/);
assert.match(manager, /root\.replaceChildren\(\)/);
assert.match(session, /activeSeconds/);
assert.match(session, /visibilitychange/);
assert.match(session, /exportJSON/);
assert.match(session, /exportCSV/);
assert.match(session, /switchStudent/);
assert.match(session, /logout/);

assert.match(sw, /SHELL_CACHE/);
assert.match(sw, /LAB_CACHE/);
assert.match(sw, /demandResponse/);
assert.match(sw, /CLEAR_LAB_CACHE/);
assert.doesNotMatch(sw, /workbench_lod2\.glb/);
assert.doesNotMatch(sw, /hall3d\.js/);
assert.doesNotMatch(sw, /electrical-bench\.css/);
assert.match(sw, /modules\/home\.js/);
assert.match(sw, /route-registry\.js/);

assert.match(router, /fallbackRoute/);
assert.match(router, /runCleanup/);
assert.match(router, /navigationId/);
assert.match(app, /RouteResourceManager/);
assert.match(app, /StudentSessionManager/);
assert.match(app, /INITIAL_ROUTE/);
assert.match(app, /import\('\.\/ui\/experience-workspace\.js'\)/);
assert.match(app, /import\('\.\/diagnostics\.js'\)/);
assert.match(app, /import\('\.\/device-validation\.js'\)/);
assert.match(app, /GuidedLearningController/);
assert.match(app, /import\('\.\/mentors\/mentor-controller\.js'\)/);
assert.doesNotMatch(app, /^import .*mentor-controller/m);
assert.match(session, /recordMentorStep/);
assert.match(app, /applyModuleTheme/);

assert.match(hall, /Versão 0\.5\.0/);
for (const route of ['coulomb','ohm','magnetism','energy','mechanics','waves','thermal','advanced']) assert.match(catalog, new RegExp(`route: '${route}'`));

const manifest = JSON.parse(manifestText);
assert.equal(manifest.version, '0.5.0');
assert.equal(manifest.groups['modular-demand-loading'].status, 'functional-demand-loaded-hub');
assert.equal(manifest.groups['modular-demand-loading'].initial3D, false);
assert.equal(manifest.groups['visual-standard'].status, 'phase-r9-expanded-mentors-v0.5.0');
assert.equal(manifest.groups['mentor-guided'].status, 'functional-expanded-on-demand-guided-mentors');
assert.equal(manifest.groups['asset-pipeline'].status, 'functional-premium-procedural-v2');
assert.equal(manifest.groups.circuits.status, 'functional-premium-electricity-lab');
assert.equal(manifest.groups.magnetism.status, 'functional-premium-electromagnetism-lab');
assert.equal(manifest.groups.energy.status, 'functional-premium-energy-house-grid-lab');
assert.equal(manifest.groups.mechanics.status, 'functional-premium-mechanics-gravity-lab');
assert.equal(manifest.groups.waves.status, 'functional-premium-waves-sound-optics-lab');
assert.equal(manifest.groups.thermal.status, 'functional-premium-thermology-gases-fluids-lab');
assert.equal(manifest.groups['advanced-frontier'].status, 'functional-premium-advanced-physics-lab');

const moduleManifest = JSON.parse(moduleManifestText);
assert.equal(moduleManifest.version, '0.5.0');
assert.equal(moduleManifest.initialRoute, 'home');
assert.equal(moduleManifest.initial3D, false);
assert.equal(moduleManifest.shell.precacheHeavyAssets, false);
assert.equal(moduleManifest.routes.length, 11);
assert.equal(moduleManifest.session.exports.includes('json'), true);
assert.equal(moduleManifest.session.exports.includes('csv'), true);
assert.equal(moduleManifest.optionalModules.mentorGuided.defaultLoaded, false);

console.log('✓ Integridade v0.5.0: portal leve, mentores sob demanda, sessão guiada e laboratórios preservados.');
