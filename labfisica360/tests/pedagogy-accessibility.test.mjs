import assert from 'node:assert/strict';
import { LAB_GUIDES, createEmptyProgress, normalizeLearningProgress, computeProgressSummary, buildLearningEvidence } from '../js/pedagogy/guided-learning.js';
import { QUALITY_PROFILES, VALIDATION_ROUTES, VALIDATION_CRITERIA, createUsageValidationEntry, summarizeUsageValidation } from '../js/pedagogy/usage-validation.js';

assert.equal(Object.keys(LAB_GUIDES).length, 10, 'Todos os setores e o roteiro de módulos devem possuir guia.');
for (const [route, guide] of Object.entries(LAB_GUIDES)) {
  assert.ok(guide.title && guide.objective && guide.simplified, `${route} precisa de objetivo completo e simplificado.`);
  assert.equal(guide.checkpoints.length, 4, `${route} precisa de quatro checkpoints.`);
  assert.equal(new Set(guide.checkpoints.map((item) => item.id)).size, 4, `${route} não pode repetir checkpoint.`);
}

const empty = normalizeLearningProgress(createEmptyProgress());
const initial = computeProgressSummary(empty);
assert.equal(initial.completed, 0);
assert.equal(initial.total, 40);
assert.equal(initial.percentage, 0);

for (const checkpoint of LAB_GUIDES.ohm.checkpoints) empty.routes.ohm.checkpoints[checkpoint.id] = { done: true, at: new Date().toISOString(), source: 'test' };
empty.routes.ohm.conclusion = 'A corrente e a tensão dependem da topologia e dos valores resistivos.';
const partial = computeProgressSummary(empty);
assert.equal(partial.completed, 4);
assert.equal(partial.completedRoutes, 1);
assert.equal(partial.percentage, 10);

const evidence = buildLearningEvidence(empty, { route: 'ohm', settings: { highContrast: true, simplifiedInstructions: true }, usageValidation: [] });
assert.equal(evidence.version, '0.5.0');
assert.deepEqual(Object.keys(evidence.routes), ['ohm']);
assert.equal(evidence.accessibility.highContrast, true);
assert.equal(evidence.accessibility.simplifiedInstructions, true);

assert.equal(QUALITY_PROFILES.length, 4);
assert.equal(VALIDATION_ROUTES.length, 8);
assert.equal(VALIDATION_CRITERIA.length, 6);
const entry = createUsageValidationEntry({ route: 'mechanics', profile: 'high', criteria: Object.fromEntries(VALIDATION_CRITERIA.map((key) => [key, 'pass'])) });
assert.equal(entry.id, 'mechanics:high');
assert.equal(summarizeUsageValidation([entry]).passes, 1);
assert.equal(summarizeUsageValidation([entry]).completed, 1);

console.log('✓ Roteiros, checkpoints, evidências, acessibilidade e matriz de validação de uso validados.');
