import assert from 'node:assert/strict';
import { CIRCUIT_TEMPLATES, MODEL_MODES, createTemplateNetwork, solveResistiveNetwork } from '../js/science/resistive-network.js';

function approx(actual, expected, tolerance = 1e-6) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≠ ${expected}`);
}

const series = solveResistiveNetwork({ sourceVoltage: 12, currentLimit: 5, modelMode: MODEL_MODES.IDEAL, network: createTemplateNetwork(CIRCUIT_TEMPLATES.SERIES, [100, 200, 300]) });
approx(series.equivalentResistance, 300);
approx(series.totalCurrent, 0.04);
approx(series.branches[0].current, series.branches[1].current);
approx(series.branches[0].voltage, 4);
approx(series.branches[1].voltage, 8);

const parallel = solveResistiveNetwork({ sourceVoltage: 12, currentLimit: 5, modelMode: MODEL_MODES.IDEAL, network: createTemplateNetwork(CIRCUIT_TEMPLATES.PARALLEL, [100, 200, 300]) });
approx(parallel.equivalentResistance, 66.66666666666667, 1e-8);
approx(parallel.branches[0].voltage, 12);
approx(parallel.branches[1].voltage, 12);
approx(parallel.totalCurrent, 0.18);

const mixed = solveResistiveNetwork({ sourceVoltage: 12, currentLimit: 5, modelMode: MODEL_MODES.IDEAL, network: createTemplateNetwork(CIRCUIT_TEMPLATES.MIXED, [100, 200, 300]) });
approx(mixed.equivalentResistance, 220, 1e-8);
approx(mixed.totalCurrent, 12 / 220, 1e-8);
approx(mixed.branches[1].voltage, mixed.branches[2].voltage, 1e-8);
approx(mixed.branches[0].current, mixed.branches[1].current + mixed.branches[2].current, 1e-8);

const limited = solveResistiveNetwork({ sourceVoltage: 12, currentLimit: 0.05, modelMode: MODEL_MODES.IDEAL, network: createTemplateNetwork(CIRCUIT_TEMPLATES.PARALLEL, [100, 100, 100]) });
assert.equal(limited.sourceMode, 'CC');
approx(limited.totalCurrent, 0.05);
approx(limited.outputVoltage, 2.5);

const realistic = solveResistiveNetwork({ sourceVoltage: 12, currentLimit: 5, modelMode: MODEL_MODES.REALISTIC, network: createTemplateNetwork(CIRCUIT_TEMPLATES.SERIES, [100, 200, 300]) });
assert.notEqual(realistic.equivalentResistance, 300);
assert.equal(realistic.branches.length, 2);

console.log('resistive-network: ok');
