export const MU0 = 4 * Math.PI * 1e-7;
const EPSILON = 1e-12;

function vector(value = {}) {
  return { x: Number(value.x || 0), y: Number(value.y || 0), z: Number(value.z || 0) };
}

export function addVectors(...vectors) {
  return vectors.reduce((sum, item) => ({ x: sum.x + item.x, y: sum.y + item.y, z: sum.z + item.z }), { x: 0, y: 0, z: 0 });
}

export function subtractVectors(a, b) {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

export function scaleVector(value, scalar) {
  return { x: value.x * scalar, y: value.y * scalar, z: value.z * scalar };
}

export function dot(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function cross(a, b) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

export function magnitude(value) {
  return Math.hypot(value.x, value.y, value.z);
}

export function normalize(value) {
  const length = magnitude(value);
  return length > EPSILON ? scaleVector(value, 1 / length) : { x: 0, y: 0, z: 0 };
}

export function magneticDipoleField({ point, dipolePosition = { x: 0, y: 0, z: 0 }, moment = { x: 0, y: 1, z: 0 }, regularization = 0.08 }) {
  const r = subtractVectors(vector(point), vector(dipolePosition));
  const distance = Math.max(regularization, magnitude(r));
  const rHat = scaleVector(r, 1 / distance);
  const m = vector(moment);
  const coefficient = MU0 / (4 * Math.PI * distance ** 3);
  return scaleVector(subtractVectors(scaleVector(rHat, 3 * dot(m, rHat)), m), coefficient);
}

export function combinedDipoleField(point, dipoles = []) {
  return addVectors(...dipoles.map((dipole) => magneticDipoleField({ point, ...dipole })));
}

export function idealSolenoidField({ turns = 300, current = 1, length = 0.3, relativePermeability = 1 }) {
  const safeLength = Math.max(Math.abs(length), EPSILON);
  return MU0 * Math.max(0, relativePermeability) * (turns / safeLength) * current;
}

export function solenoidInductance({ turns = 300, area = 0.002, length = 0.3, relativePermeability = 1 }) {
  const safeLength = Math.max(Math.abs(length), EPSILON);
  return MU0 * Math.max(0, relativePermeability) * turns ** 2 * Math.max(0, area) / safeLength;
}

export function magneticFlux({ field = 0, area = 1, angle = 0 }) {
  return field * area * Math.cos(angle);
}

export function faradayEmf({ turns = 1, fluxInitial = 0, fluxFinal = 0, deltaTime = 1 }) {
  const safeTime = Math.max(Math.abs(deltaTime), EPSILON);
  return -turns * (fluxFinal - fluxInitial) / safeTime;
}

export function generatorInstantaneousEmf({ turns = 100, field = 0.4, area = 0.01, angularSpeed = 20, time = 0, phase = 0 }) {
  const peak = turns * field * area * angularSpeed;
  return peak * Math.sin(angularSpeed * time + phase);
}

export function generatorPeakEmf({ turns = 100, field = 0.4, area = 0.01, angularSpeed = 20 }) {
  return Math.abs(turns * field * area * angularSpeed);
}

export function generatorRmsEmf(input) {
  return generatorPeakEmf(input) / Math.sqrt(2);
}

export function lorentzForce({ charge = 1, velocity, field }) {
  return scaleVector(cross(vector(velocity), vector(field)), charge);
}

export function wireMagneticForce({ current = 1, lengthVector, field }) {
  return scaleVector(cross(vector(lengthVector), vector(field)), current);
}

export function motorTorque({ turns = 1, current = 1, area = 1, field = 1, angle = Math.PI / 2 }) {
  return turns * current * area * field * Math.sin(angle);
}

export function magneticEnergy({ inductance = 0, current = 0 }) {
  return 0.5 * Math.max(0, inductance) * current ** 2;
}

export function transformerIdeal({ primaryTurns = 500, secondaryTurns = 100, primaryVoltage = 120, primaryCurrent = 1, efficiency = 1 }) {
  const ratio = Math.max(EPSILON, Math.abs(secondaryTurns)) / Math.max(EPSILON, Math.abs(primaryTurns));
  const safeEfficiency = Math.min(1, Math.max(0, efficiency));
  const secondaryVoltage = primaryVoltage * ratio;
  const inputPower = primaryVoltage * primaryCurrent;
  const outputPower = inputPower * safeEfficiency;
  const secondaryCurrent = Math.abs(secondaryVoltage) > EPSILON ? outputPower / secondaryVoltage : 0;
  return {
    ratio,
    primaryVoltage,
    secondaryVoltage,
    primaryCurrent,
    secondaryCurrent,
    inputPower,
    outputPower,
    losses: Math.max(0, inputPower - outputPower),
  };
}

export function electromagnetState({ current = 1.5, turns = 450, length = 0.34, radius = 0.045, relativePermeability = 1, resistance = 4, ambientTemperature = 24 }) {
  const area = Math.PI * radius ** 2;
  const field = idealSolenoidField({ current, turns, length, relativePermeability });
  const inductance = solenoidInductance({ turns, area, length, relativePermeability });
  const energy = magneticEnergy({ inductance, current });
  const power = current ** 2 * Math.max(0, resistance);
  const temperature = ambientTemperature + power * 1.8;
  return { field, inductance, energy, power, temperature, area };
}

export function generatorState({ turns = 160, field = 0.48, area = 0.012, rpm = 900, time = 0, loadResistance = 24, efficiency = 0.86 }) {
  const angularSpeed = Math.max(0, rpm) * 2 * Math.PI / 60;
  const peakVoltage = generatorPeakEmf({ turns, field, area, angularSpeed });
  const rmsVoltage = peakVoltage / Math.sqrt(2);
  const current = rmsVoltage / Math.max(EPSILON, loadResistance);
  const electricalPower = rmsVoltage * current;
  const mechanicalPower = electricalPower / Math.max(EPSILON, Math.min(1, Math.max(0.01, efficiency)));
  return {
    angularSpeed,
    peakVoltage,
    rmsVoltage,
    instantaneousVoltage: generatorInstantaneousEmf({ turns, field, area, angularSpeed, time }),
    current,
    electricalPower,
    mechanicalPower,
    losses: Math.max(0, mechanicalPower - electricalPower),
  };
}

export function motorState({ turns = 120, current = 1.8, area = 0.008, field = 0.42, angle = Math.PI / 2, angularSpeed = 32, resistance = 3.2 }) {
  const torque = motorTorque({ turns, current, area, field, angle });
  const mechanicalPower = Math.abs(torque * angularSpeed);
  const copperLoss = current ** 2 * Math.max(0, resistance);
  const electricalPower = mechanicalPower + copperLoss;
  const efficiency = electricalPower > EPSILON ? mechanicalPower / electricalPower : 0;
  return { torque, mechanicalPower, copperLoss, electricalPower, efficiency };
}
