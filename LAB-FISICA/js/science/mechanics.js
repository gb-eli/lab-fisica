const EPS = 1e-9;
export const STANDARD_GRAVITY = 9.80665;
export const CELESTIAL_GRAVITY = Object.freeze({ earth: 9.80665, moon: 1.62, mars: 3.71, jupiter: 24.79 });

export const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));
export const degToRad = (degrees) => Number(degrees) * Math.PI / 180;
export const radToDeg = (radians) => Number(radians) * 180 / Math.PI;

export function linearMotion({ position0 = 0, velocity0 = 0, acceleration = 0, time = 0 } = {}) {
  const t = Math.max(0, Number(time) || 0);
  return {
    position: Number(position0) + Number(velocity0) * t + 0.5 * Number(acceleration) * t * t,
    velocity: Number(velocity0) + Number(acceleration) * t,
    acceleration: Number(acceleration),
  };
}

export function freeFallState({ height = 10, gravity = STANDARD_GRAVITY, time = 0, velocity0 = 0 } = {}) {
  const g = Math.max(EPS, Number(gravity) || STANDARD_GRAVITY);
  const h = Math.max(0, Number(height) || 0);
  const v0 = Number(velocity0) || 0;
  const discriminant = Math.max(0, v0 * v0 + 2 * g * h);
  const impactTime = (v0 + Math.sqrt(discriminant)) / g;
  const t = clamp(time, 0, impactTime);
  const y = Math.max(0, h + v0 * t - 0.5 * g * t * t);
  const velocity = v0 - g * t;
  return {
    height: y,
    velocity,
    acceleration: -g,
    impactTime,
    impactSpeed: Math.sqrt(discriminant),
    potentialEnergyPerKg: g * y,
    kineticEnergyPerKg: 0.5 * velocity * velocity,
    landed: t >= impactTime - 1e-6,
  };
}

export function inclineState({
  mass = 1,
  angleDeg = 20,
  gravity = STANDARD_GRAVITY,
  muStatic = 0.35,
  muKinetic = 0.25,
  appliedForce = 0,
} = {}) {
  const m = Math.max(EPS, Number(mass) || 1);
  const g = Math.max(EPS, Number(gravity) || STANDARD_GRAVITY);
  const angle = degToRad(clamp(angleDeg, -85, 85));
  const normal = Math.max(0, m * g * Math.cos(angle));
  const downhill = m * g * Math.sin(angle);
  const drive = downhill + Number(appliedForce || 0);
  const staticLimit = Math.max(0, Number(muStatic) || 0) * normal;
  const moving = Math.abs(drive) > staticLimit + EPS;
  const friction = moving
    ? -Math.sign(drive || 1) * Math.max(0, Number(muKinetic) || 0) * normal
    : -drive;
  const netForce = drive + friction;
  return {
    normal,
    gravityParallel: downhill,
    staticLimit,
    friction,
    netForce,
    acceleration: moving ? netForce / m : 0,
    moving,
    angle,
  };
}

function linearDragAxis({ position0 = 0, velocity0 = 0, acceleration = 0, dragPerMass = 0, time = 0 }) {
  const t = Math.max(0, Number(time) || 0);
  const gamma = Math.max(0, Number(dragPerMass) || 0);
  if (gamma < 1e-7) return linearMotion({ position0, velocity0, acceleration, time: t });
  const terminal = acceleration / gamma;
  const exponential = Math.exp(-gamma * t);
  return {
    position: position0 + (velocity0 - terminal) * (1 - exponential) / gamma + terminal * t,
    velocity: (velocity0 - terminal) * exponential + terminal,
    acceleration: acceleration - gamma * ((velocity0 - terminal) * exponential + terminal),
  };
}

export function projectileState({
  speed = 18,
  angleDeg = 45,
  height = 0.8,
  gravity = STANDARD_GRAVITY,
  dragCoefficient = 0,
  mass = 1,
  time = 0,
} = {}) {
  const g = Math.max(EPS, Number(gravity) || STANDARD_GRAVITY);
  const v = Math.max(0, Number(speed) || 0);
  const angle = degToRad(angleDeg);
  const vx0 = v * Math.cos(angle);
  const vy0 = v * Math.sin(angle);
  const gamma = Math.max(0, Number(dragCoefficient) || 0) / Math.max(EPS, Number(mass) || 1);
  const xAxis = linearDragAxis({ velocity0: vx0, acceleration: 0, dragPerMass: gamma, time });
  const yAxis = linearDragAxis({ position0: Math.max(0, Number(height) || 0), velocity0: vy0, acceleration: -g, dragPerMass: gamma, time });
  const speedNow = Math.hypot(xAxis.velocity, yAxis.velocity);
  return {
    x: xAxis.position,
    y: yAxis.position,
    vx: xAxis.velocity,
    vy: yAxis.velocity,
    ax: xAxis.acceleration,
    ay: yAxis.acceleration,
    speed: speedNow,
    angle: Math.atan2(yAxis.velocity, xAxis.velocity),
    kineticEnergy: 0.5 * Math.max(EPS, Number(mass) || 1) * speedNow * speedNow,
    potentialEnergy: Math.max(EPS, Number(mass) || 1) * g * Math.max(0, yAxis.position),
  };
}

export function projectileFlight({
  speed = 18,
  angleDeg = 45,
  height = 0.8,
  gravity = STANDARD_GRAVITY,
  dragCoefficient = 0,
  mass = 1,
  samples = 90,
} = {}) {
  const idealGuess = (speed * Math.sin(degToRad(angleDeg)) + Math.sqrt(Math.max(0, (speed * Math.sin(degToRad(angleDeg))) ** 2 + 2 * gravity * height))) / Math.max(EPS, gravity);
  let low = 0;
  let high = Math.max(0.2, idealGuess * (dragCoefficient > 0 ? 2.2 : 1.1) + 0.5);
  while (projectileState({ speed, angleDeg, height, gravity, dragCoefficient, mass, time: high }).y > 0 && high < 120) high *= 1.5;
  for (let index = 0; index < 80; index += 1) {
    const mid = (low + high) / 2;
    if (projectileState({ speed, angleDeg, height, gravity, dragCoefficient, mass, time: mid }).y > 0) low = mid;
    else high = mid;
  }
  const flightTime = Math.max(0, high);
  const points = [];
  let maximumHeight = -Infinity;
  for (let index = 0; index <= samples; index += 1) {
    const time = flightTime * index / samples;
    const state = projectileState({ speed, angleDeg, height, gravity, dragCoefficient, mass, time });
    state.y = Math.max(0, state.y);
    maximumHeight = Math.max(maximumHeight, state.y);
    points.push({ time, ...state });
  }
  const impact = points.at(-1) || projectileState({ speed, angleDeg, height, gravity, dragCoefficient, mass, time: flightTime });
  return { flightTime, range: impact.x, maximumHeight, impactSpeed: impact.speed, points };
}

export function collision1D({ mass1 = 1, mass2 = 1, velocity1 = 2, velocity2 = -1, restitution = 1 } = {}) {
  const m1 = Math.max(EPS, Number(mass1) || 1);
  const m2 = Math.max(EPS, Number(mass2) || 1);
  const u1 = Number(velocity1) || 0;
  const u2 = Number(velocity2) || 0;
  const e = clamp(restitution, 0, 1);
  const v1 = (m1 * u1 + m2 * u2 - m2 * e * (u1 - u2)) / (m1 + m2);
  const v2 = (m1 * u1 + m2 * u2 + m1 * e * (u1 - u2)) / (m1 + m2);
  const momentumBefore = m1 * u1 + m2 * u2;
  const momentumAfter = m1 * v1 + m2 * v2;
  const kineticBefore = 0.5 * m1 * u1 * u1 + 0.5 * m2 * u2 * u2;
  const kineticAfter = 0.5 * m1 * v1 * v1 + 0.5 * m2 * v2 * v2;
  return {
    velocity1: v1,
    velocity2: v2,
    momentumBefore,
    momentumAfter,
    kineticBefore,
    kineticAfter,
    energyRetained: kineticBefore > EPS ? kineticAfter / kineticBefore : 1,
    energyLost: Math.max(0, kineticBefore - kineticAfter),
  };
}

export function springMassState({
  mass = 1,
  springConstant = 18,
  damping = 0.25,
  amplitude = 0.45,
  phase = 0,
  time = 0,
} = {}) {
  const m = Math.max(EPS, Number(mass) || 1);
  const k = Math.max(EPS, Number(springConstant) || 1);
  const c = Math.max(0, Number(damping) || 0);
  const omega0 = Math.sqrt(k / m);
  const gamma = c / (2 * m);
  const omegaD = Math.sqrt(Math.max(0, omega0 * omega0 - gamma * gamma));
  const t = Math.max(0, Number(time) || 0);
  const a = Number(amplitude) || 0;
  const decay = Math.exp(-gamma * t);
  const angle = omegaD * t + Number(phase || 0);
  const position = a * decay * Math.cos(angle);
  const velocity = a * decay * (-gamma * Math.cos(angle) - omegaD * Math.sin(angle));
  const energy = 0.5 * m * velocity * velocity + 0.5 * k * position * position;
  return { position, velocity, acceleration: -(k / m) * position - (c / m) * velocity, energy, omega0, omegaD, period: omegaD > EPS ? 2 * Math.PI / omegaD : Infinity, regime: gamma < omega0 ? 'subamortecido' : gamma === omega0 ? 'crítico' : 'superamortecido' };
}

export function pendulumState({ length = 1.2, gravity = STANDARD_GRAVITY, angleDeg = 25, damping = 0.04, time = 0 } = {}) {
  const L = Math.max(EPS, Number(length) || 1);
  const g = Math.max(EPS, Number(gravity) || STANDARD_GRAVITY);
  const theta0 = degToRad(angleDeg);
  const gamma = Math.max(0, Number(damping) || 0);
  const omega = Math.sqrt(g / L);
  const t = Math.max(0, Number(time) || 0);
  const theta = theta0 * Math.exp(-gamma * t) * Math.cos(omega * t);
  const angularVelocity = theta0 * Math.exp(-gamma * t) * (-gamma * Math.cos(omega * t) - omega * Math.sin(omega * t));
  return {
    angle: theta,
    angularVelocity,
    period: 2 * Math.PI * Math.sqrt(L / g),
    x: L * Math.sin(theta),
    y: -L * Math.cos(theta),
  };
}

export function circularOrbit({ radius = 7e6, centralMass = 5.972e24, gravitationalConstant = 6.67430e-11 } = {}) {
  const r = Math.max(EPS, Number(radius) || 1);
  const M = Math.max(EPS, Number(centralMass) || 1);
  const G = Math.max(EPS, Number(gravitationalConstant) || 6.67430e-11);
  const velocity = Math.sqrt(G * M / r);
  const period = 2 * Math.PI * Math.sqrt(r ** 3 / (G * M));
  const acceleration = G * M / (r * r);
  return { velocity, period, acceleration };
}

export function conservationAudit({ kinetic = 0, potential = 0, spring = 0, dissipated = 0 } = {}) {
  const mechanical = Number(kinetic) + Number(potential) + Number(spring);
  return { mechanical, total: mechanical + Math.max(0, Number(dissipated) || 0) };
}
