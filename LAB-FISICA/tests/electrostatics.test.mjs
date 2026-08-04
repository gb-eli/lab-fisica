import assert from 'node:assert/strict';
import {
  COULOMB_CONSTANT,
  pairInteraction,
  electricFieldAt,
  electricPotentialAt,
} from '../js/science/electrostatics.js';

const tolerance = (actual, expected, relative = 1e-9) => {
  assert.ok(Math.abs(actual - expected) <= Math.max(1e-12, Math.abs(expected) * relative), `${actual} != ${expected}`);
};

const p1 = { x: 0, y: 0, z: 0 };
const p2 = { x: 1, y: 0, z: 0 };

const repulsion = pairInteraction(1e-6, p1, 1e-6, p2);
tolerance(repulsion.magnitude, COULOMB_CONSTANT * 1e-12, 1e-12);
assert.equal(repulsion.interaction, 'repulsion');
assert.ok(repulsion.forceOn1.x < 0);
assert.ok(repulsion.forceOn2.x > 0);
tolerance(repulsion.forceOn1.x, -repulsion.forceOn2.x);

const attraction = pairInteraction(1e-6, p1, -1e-6, p2);
assert.equal(attraction.interaction, 'attraction');
assert.ok(attraction.forceOn1.x > 0);

const halfDistance = pairInteraction(1e-6, p1, 1e-6, { x: 0.5, y: 0, z: 0 });
tolerance(halfDistance.magnitude / repulsion.magnitude, 4, 1e-12);

const field = electricFieldAt([{ q: 1e-6, position: p1 }], p2);
tolerance(field.magnitude, COULOMB_CONSTANT * 1e-6, 1e-12);
assert.ok(field.x > 0);

const potential = electricPotentialAt([{ q: 1e-6, position: p1 }], p2);
tolerance(potential, COULOMB_CONSTANT * 1e-6, 1e-12);

const symmetricField = electricFieldAt([
  { q: 1e-6, position: { x: -1, y: 0, z: 0 } },
  { q: 1e-6, position: { x: 1, y: 0, z: 0 } },
], { x: 0, y: 0, z: 0 });
tolerance(symmetricField.magnitude, 0, 1e-8);

console.log('Electrostatics tests: OK');
