import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
for (const path of ['js/render/webgl-preflight.js','js/render/render-watchdog.js','tools/webgl_pilot_test.py','validation/r6-webgl-pilot.json','assets/r6-webgl-pilot.json','docs/PILOTO_WEBGL_R6.md','docs/RELATORIO_VALIDACAO_V0.4.5.md']) assert.ok(existsSync(new URL(`../${path}`, import.meta.url)), path);
const preflight=read('js/render/webgl-preflight.js');
assert.match(preflight,/compileShader/); assert.match(preflight,/readPixels/); assert.match(preflight,/WEBGL_lose_context/); assert.match(preflight,/classifyTier/);
const runtime=read('js/render/runtime.js');
assert.match(runtime,/runWebGLPreflight/); assert.match(runtime,/createRenderWatchdog/); assert.match(runtime,/fisica:render-ready/); assert.match(runtime,/fisica:render-fallback/); assert.match(runtime,/firstFrameTimeout/);
const index=read('index.html'); assert.match(index,/id="run-webgl-preflight"/); assert.match(index,/id="safe-3d"/);
const report=JSON.parse(read('validation/r6-webgl-pilot.json'));
assert.equal(report.version,'0.4.5'); assert.equal(report.passed,true); assert.equal(report.profiles.length,2);
for (const profile of report.profiles) { assert.equal(profile.passed,true,profile.profile); assert.equal(profile.report.webglVersion,2); assert.equal(profile.report.drawPassed,true); assert.equal(profile.report.recovery.restored,true); }
const contract=JSON.parse(read('assets/r6-webgl-pilot.json')); assert.equal(contract.version,'0.4.5');
console.log('✓ R6 v0.4.5: pré-teste, watchdog e piloto WebGL por software validados.');
