import assert from 'node:assert/strict';
import { ADVANCED_TOPICS } from '../js/modules/advanced.js';

const expected = ['quantum', 'darkMatter', 'relativity', 'blackHole', 'timeTravel'];
assert.deepEqual(Object.keys(ADVANCED_TOPICS), expected);
assert.equal('chemistry' in ADVANCED_TOPICS, false, 'Química não deve fazer parte da plataforma de Física.');
assert.match(ADVANCED_TOPICS.darkMatter.warning, /não foi fotografada|metáfora visual/i);
assert.match(ADVANCED_TOPICS.timeTravel.warning, /especulativo|não apresenta um método real/i);
assert.match(ADVANCED_TOPICS.quantum.warning, /Schrödinger|método numérico/i);
console.log('✓ Contratos da Física Avançada validados e Química separada.');
