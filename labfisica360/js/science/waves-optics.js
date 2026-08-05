const EPS = 1e-9;
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
const degToRad = (value) => Number(value || 0) * Math.PI / 180;
const radToDeg = (value) => Number(value || 0) * 180 / Math.PI;

export const SPEED_OF_LIGHT = 299792458;
export const REFERENCE_SOUND_INTENSITY = 1e-12;

export function waveRelations({ frequency = 1, speed = 1, amplitude = 1, phase = 0 } = {}) {
  const f = Math.max(EPS, Number(frequency) || 1);
  const v = Math.max(EPS, Number(speed) || 1);
  return {
    frequency: f,
    speed: v,
    amplitude: Number(amplitude) || 0,
    phase: Number(phase) || 0,
    period: 1 / f,
    wavelength: v / f,
    angularFrequency: 2 * Math.PI * f,
    waveNumber: 2 * Math.PI * f / v,
  };
}

export function harmonicWave({ x = 0, time = 0, amplitude = 1, frequency = 1, speed = 1, phase = 0, damping = 0 } = {}) {
  const relation = waveRelations({ frequency, speed, amplitude, phase });
  const envelope = Math.exp(-Math.max(0, Number(damping) || 0) * Math.max(0, Number(x) || 0));
  const angle = relation.waveNumber * Number(x || 0) - relation.angularFrequency * Number(time || 0) + relation.phase;
  return {
    displacement: relation.amplitude * envelope * Math.sin(angle),
    velocity: -relation.amplitude * envelope * relation.angularFrequency * Math.cos(angle),
    acceleration: -relation.amplitude * envelope * relation.angularFrequency ** 2 * Math.sin(angle),
    ...relation,
  };
}

export function resultantAmplitude({ amplitude1 = 1, amplitude2 = 1, phaseDifference = 0 } = {}) {
  const a1 = Number(amplitude1) || 0;
  const a2 = Number(amplitude2) || 0;
  const phase = Number(phaseDifference) || 0;
  return Math.sqrt(Math.max(0, a1 * a1 + a2 * a2 + 2 * a1 * a2 * Math.cos(phase)));
}

export function twoSourceInterference({ x = 0, z = 0, time = 0, amplitude = 0.5, frequency = 1.5, speed = 3, sourceSeparation = 2, phaseDifference = 0, damping = 0.03 } = {}) {
  const half = Math.max(0.05, Number(sourceSeparation) || 2) / 2;
  const r1 = Math.hypot(Number(x) + half, Number(z));
  const r2 = Math.hypot(Number(x) - half, Number(z));
  const w1 = harmonicWave({ x: r1, time, amplitude, frequency, speed, phase: 0, damping });
  const w2 = harmonicWave({ x: r2, time, amplitude, frequency, speed, phase: phaseDifference, damping });
  return {
    displacement: w1.displacement + w2.displacement,
    pathDifference: r2 - r1,
    phaseDifference: w2.waveNumber * (r2 - r1) + Number(phaseDifference || 0),
    r1,
    r2,
    wavelength: w1.wavelength,
  };
}

export function diffractionFactor({ wavelength = 1, slitWidth = 1, angleDeg = 0 } = {}) {
  const lambda = Math.max(EPS, Number(wavelength) || 1);
  const width = Math.max(EPS, Number(slitWidth) || 1);
  const beta = Math.PI * width * Math.sin(degToRad(angleDeg)) / lambda;
  if (Math.abs(beta) < 1e-8) return 1;
  return (Math.sin(beta) / beta) ** 2;
}

export function stringMode({ length = 1, tension = 100, linearDensity = 0.01, harmonic = 1, amplitude = 0.2, x = 0, time = 0, damping = 0 } = {}) {
  const L = Math.max(EPS, Number(length) || 1);
  const force = Math.max(EPS, Number(tension) || 1);
  const density = Math.max(EPS, Number(linearDensity) || 0.01);
  const n = Math.max(1, Math.round(Number(harmonic) || 1));
  const speed = Math.sqrt(force / density);
  const frequency = n * speed / (2 * L);
  const omega = 2 * Math.PI * frequency;
  const position = clamp(x, 0, L);
  const envelope = Math.exp(-Math.max(0, Number(damping) || 0) * Math.max(0, Number(time) || 0));
  const displacement = Number(amplitude || 0) * envelope * Math.sin(n * Math.PI * position / L) * Math.cos(omega * Number(time || 0));
  const nodes = Array.from({ length: n + 1 }, (_, index) => index * L / n);
  return { displacement, speed, frequency, period: 1 / frequency, wavelength: 2 * L / n, harmonic: n, nodes };
}

export function openTubeFrequency({ length = 1, speed = 343, harmonic = 1 } = {}) {
  const L = Math.max(EPS, Number(length) || 1);
  const n = Math.max(1, Math.round(Number(harmonic) || 1));
  return n * Math.max(EPS, Number(speed) || 343) / (2 * L);
}

export function closedTubeFrequency({ length = 1, speed = 343, mode = 1 } = {}) {
  const L = Math.max(EPS, Number(length) || 1);
  const odd = Math.max(1, 2 * Math.round(Math.max(1, Number(mode) || 1)) - 1);
  return odd * Math.max(EPS, Number(speed) || 343) / (4 * L);
}

export function soundSpeedAir({ temperatureC = 20 } = {}) {
  return 331.3 + 0.606 * Number(temperatureC || 0);
}

export function soundIntensity({ power = 0.01, distance = 1, reference = REFERENCE_SOUND_INTENSITY } = {}) {
  const P = Math.max(0, Number(power) || 0);
  const r = Math.max(EPS, Number(distance) || 1);
  const intensity = P / (4 * Math.PI * r * r);
  const levelDb = intensity > 0 ? 10 * Math.log10(intensity / Math.max(EPS, Number(reference) || REFERENCE_SOUND_INTENSITY)) : -Infinity;
  return { intensity, levelDb };
}

export function echoDistance({ delay = 0.1, speed = 343 } = {}) {
  return Math.max(0, Number(delay) || 0) * Math.max(EPS, Number(speed) || 343) / 2;
}

export function sabineReverberation({ volume = 100, absorptionArea = 20 } = {}) {
  return 0.161 * Math.max(EPS, Number(volume) || 100) / Math.max(EPS, Number(absorptionArea) || 20);
}

export function dopplerFrequency({ sourceFrequency = 440, waveSpeed = 343, sourceVelocity = 0, observerVelocity = 0 } = {}) {
  const f = Math.max(EPS, Number(sourceFrequency) || 440);
  const v = Math.max(EPS, Number(waveSpeed) || 343);
  const vo = clamp(observerVelocity, -0.95 * v, 0.95 * v);
  const vs = clamp(sourceVelocity, -0.95 * v, 0.95 * v);
  const denominator = Math.max(EPS, v - vs);
  return {
    observedFrequency: f * (v + vo) / denominator,
    wavelengthAhead: (v - vs) / f,
    wavelengthBehind: (v + vs) / f,
  };
}

export function beatFrequency(frequency1 = 440, frequency2 = 442) {
  return Math.abs(Number(frequency1) - Number(frequency2));
}

export function reflectVector2D({ direction = [1, -1], normal = [0, 1] } = {}) {
  const [dx, dy] = direction.map(Number);
  const [nx0, ny0] = normal.map(Number);
  const norm = Math.hypot(nx0, ny0) || 1;
  const nx = nx0 / norm;
  const ny = ny0 / norm;
  const dot = dx * nx + dy * ny;
  return [dx - 2 * dot * nx, dy - 2 * dot * ny];
}

export function snellRefraction({ n1 = 1, n2 = 1.5, incidentAngleDeg = 30 } = {}) {
  const first = Math.max(EPS, Number(n1) || 1);
  const second = Math.max(EPS, Number(n2) || 1.5);
  const incident = degToRad(clamp(incidentAngleDeg, 0, 89.999));
  const sinRefraction = first / second * Math.sin(incident);
  if (Math.abs(sinRefraction) > 1) return { totalInternalReflection: true, refractedAngleDeg: null, reflectedAngleDeg: radToDeg(incident) };
  return {
    totalInternalReflection: false,
    refractedAngleDeg: radToDeg(Math.asin(sinRefraction)),
    reflectedAngleDeg: radToDeg(incident),
    speedRatio: first / second,
  };
}

export function thinLens({ focalLength = 1, objectDistance = 2, objectHeight = 1 } = {}) {
  const f = Number(focalLength) || 1;
  const p = Number(objectDistance) || 2;
  const denominator = 1 / f - 1 / p;
  const imageDistance = Math.abs(denominator) < EPS ? Infinity : 1 / denominator;
  const magnification = Number.isFinite(imageDistance) ? -imageDistance / p : Infinity;
  return {
    imageDistance,
    magnification,
    imageHeight: Number(objectHeight || 0) * magnification,
    real: imageDistance > 0,
    inverted: magnification < 0,
  };
}

export function sphericalMirror(options = {}) {
  return thinLens(options);
}

export function criticalAngle({ n1 = 1.5, n2 = 1 } = {}) {
  const first = Math.max(EPS, Number(n1) || 1.5);
  const second = Math.max(EPS, Number(n2) || 1);
  if (first <= second) return null;
  return radToDeg(Math.asin(second / first));
}

export function fiberGuidance({ coreIndex = 1.48, claddingIndex = 1.46, externalIndex = 1, entryAngleDeg = 10 } = {}) {
  const core = Math.max(EPS, Number(coreIndex) || 1.48);
  const clad = Math.max(EPS, Math.min(core, Number(claddingIndex) || 1.46));
  const ext = Math.max(EPS, Number(externalIndex) || 1);
  const numericalAperture = Math.sqrt(Math.max(0, core * core - clad * clad));
  const acceptanceAngleDeg = radToDeg(Math.asin(Math.min(1, numericalAperture / ext)));
  return {
    numericalAperture,
    acceptanceAngleDeg,
    guided: Math.abs(Number(entryAngleDeg) || 0) <= acceptanceAngleDeg,
    criticalAngleDeg: criticalAngle({ n1: core, n2: clad }),
  };
}

export function doubleSlit({ wavelengthNm = 550, slitSeparationMm = 0.5, screenDistanceM = 2, slitWidthMm = 0.08 } = {}) {
  const wavelength = Math.max(EPS, Number(wavelengthNm) || 550) * 1e-9;
  const separation = Math.max(EPS, Number(slitSeparationMm) || 0.5) * 1e-3;
  const width = Math.max(EPS, Number(slitWidthMm) || 0.08) * 1e-3;
  const distance = Math.max(EPS, Number(screenDistanceM) || 2);
  return {
    fringeSpacing: wavelength * distance / separation,
    centralEnvelopeWidth: 2 * wavelength * distance / width,
  };
}

export function wavelengthToRgb(wavelengthNm = 550) {
  const w = clamp(wavelengthNm, 380, 780);
  let r = 0, g = 0, b = 0;
  if (w < 440) { r = -(w - 440) / 60; b = 1; }
  else if (w < 490) { g = (w - 440) / 50; b = 1; }
  else if (w < 510) { g = 1; b = -(w - 510) / 20; }
  else if (w < 580) { r = (w - 510) / 70; g = 1; }
  else if (w < 645) { r = 1; g = -(w - 645) / 65; }
  else r = 1;
  let factor = 1;
  if (w < 420) factor = 0.3 + 0.7 * (w - 380) / 40;
  else if (w > 700) factor = 0.3 + 0.7 * (780 - w) / 80;
  const gamma = 0.8;
  return [r, g, b].map((channel) => Math.round(255 * Math.pow(Math.max(0, channel * factor), gamma)));
}

export function prismIndex({ wavelengthNm = 550, baseIndex = 1.5, dispersion = 0.004 } = {}) {
  const wavelengthMicrometers = Math.max(0.38, Number(wavelengthNm) || 550) / 1000;
  return Number(baseIndex || 1.5) + Number(dispersion || 0.004) / (wavelengthMicrometers * wavelengthMicrometers);
}
