import assert from 'node:assert/strict';
import {
  magneticDipoleField,
  idealSolenoidField,
  solenoidInductance,
  magneticFlux,
  faradayEmf,
  lorentzForce,
  wireMagneticForce,
  motorTorque,
  generatorPeakEmf,
  transformerIdeal,
  electromagnetState,
  generatorState,
  motorState,
  magnitude,
} from '../js/science/electromagnetism.js';

const axial = magneticDipoleField({ point: { x: 1, y: 0, z: 0 }, moment: { x: 1, y: 0, z: 0 }, regularization: 0 });
const equatorial = magneticDipoleField({ point: { x: 0, y: 1, z: 0 }, moment: { x: 1, y: 0, z: 0 }, regularization: 0 });
assert.ok(Math.abs(magnitude(axial) / magnitude(equatorial) - 2) < 1e-9, 'O campo axial de dipolo deve ser o dobro do equatorial à mesma distância.');
assert.ok(axial.x > 0 && equatorial.x < 0, 'As direções axial e equatorial devem ser coerentes.');

const solenoidA = idealSolenoidField({ turns: 300, current: 1, length: 0.3, relativePermeability: 1 });
const solenoidB = idealSolenoidField({ turns: 300, current: 2, length: 0.3, relativePermeability: 1 });
assert.ok(Math.abs(solenoidB / solenoidA - 2) < 1e-12, 'O campo do solenoide ideal deve ser proporcional à corrente.');
assert.ok(solenoidInductance({ turns: 600, area: 0.002, length: 0.3 }) > solenoidInductance({ turns: 300, area: 0.002, length: 0.3 }) * 3.9, 'A indutância deve crescer aproximadamente com N².');

assert.ok(Math.abs(magneticFlux({ field: 0.5, area: 0.2, angle: 0 }) - 0.1) < 1e-12);
assert.ok(Math.abs(faradayEmf({ turns: 20, fluxInitial: 0.01, fluxFinal: 0.03, deltaTime: 0.1 }) + 4) < 1e-12, 'A fem deve ter sinal oposto à variação de fluxo.');

const lorentz = lorentzForce({ charge: 2, velocity: { x: 1, y: 0, z: 0 }, field: { x: 0, y: 1, z: 0 } });
assert.deepEqual(lorentz, { x: 0, y: 0, z: 2 });
const wire = wireMagneticForce({ current: 3, lengthVector: { x: 0.4, y: 0, z: 0 }, field: { x: 0, y: 0.5, z: 0 } });
assert.ok(Math.abs(wire.z - 0.6) < 1e-12);
assert.ok(Math.abs(motorTorque({ turns: 10, current: 2, area: 0.03, field: 0.4, angle: Math.PI / 2 }) - 0.24) < 1e-12);

assert.ok(Math.abs(generatorPeakEmf({ turns: 100, field: 0.5, area: 0.02, angularSpeed: 20 }) - 20) < 1e-12);
const transformer = transformerIdeal({ primaryTurns: 500, secondaryTurns: 1000, primaryVoltage: 120, primaryCurrent: 2, efficiency: 0.9 });
assert.equal(transformer.secondaryVoltage, 240);
assert.ok(Math.abs(transformer.secondaryCurrent - 0.9) < 1e-12);
assert.ok(Math.abs(transformer.outputPower - 216) < 1e-12);

const electromagnet = electromagnetState({ current: 2, turns: 450, length: 0.34, radius: 0.045, relativePermeability: 80, resistance: 4 });
assert.ok(electromagnet.field > 0 && electromagnet.inductance > 0 && electromagnet.temperature > 24);
const generator = generatorState({ turns: 160, field: 0.48, area: 0.012, rpm: 900, loadResistance: 24, efficiency: 0.86 });
assert.ok(generator.rmsVoltage > 0 && generator.current > 0 && generator.mechanicalPower > generator.electricalPower);
const motor = motorState({ turns: 120, current: 1.8, area: 0.008, field: 0.42, angle: Math.PI / 2, angularSpeed: 32, resistance: 3.2 });
assert.ok(motor.torque > 0 && motor.mechanicalPower > 0 && motor.efficiency > 0 && motor.efficiency < 1);

console.log('✓ Eletromagnetismo: dipolo, solenoide, Faraday-Lenz, forças, motor, gerador e transformador validados.');
