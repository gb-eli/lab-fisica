export const C = 299_792_458;
export const G = 6.67430e-11;
export const H = 6.62607015e-34;
export const HBAR = H / (2 * Math.PI);
export const ELECTRON_MASS = 9.1093837015e-31;
export const SOLAR_MASS = 1.98847e30;
export const LIGHT_YEAR = 9.4607304725808e15;
export const PARSEC = 3.085677581491367e16;
export const KILOPARSEC = PARSEC * 1_000;
export const ELECTRON_VOLT = 1.602176634e-19;

const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const positive = (value, fallback = 1) => Math.max(Number.EPSILON, finite(value, fallback));
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function lorentzFactor({ beta, speed } = {}) {
  const ratio = beta == null ? finite(speed) / C : finite(beta);
  const safe = clamp(Math.abs(ratio), 0, 0.999999999999);
  return 1 / Math.sqrt(1 - safe * safe);
}

export function deBroglieWavelength({ massKg = ELECTRON_MASS, speed = C * 0.05 } = {}) {
  const m = positive(massKg, ELECTRON_MASS);
  const v = clamp(Math.abs(finite(speed)), Number.EPSILON, C * 0.999999999);
  const gamma = lorentzFactor({ speed: v });
  const momentum = gamma * m * v;
  return { wavelength: H / momentum, momentum, gamma };
}

export function gaussianWavePacket({ x = 0, center = 0, sigma = 1, waveNumber = 1, time = 0, angularFrequency = 1 } = {}) {
  const s = positive(sigma);
  const dx = finite(x) - finite(center);
  const envelope = Math.exp(-(dx * dx) / (4 * s * s));
  const normalization = 1 / Math.sqrt(s * Math.sqrt(2 * Math.PI));
  const phase = finite(waveNumber) * dx - finite(angularFrequency) * finite(time);
  const real = normalization * envelope * Math.cos(phase);
  const imaginary = normalization * envelope * Math.sin(phase);
  return { real, imaginary, probabilityDensity: real * real + imaginary * imaginary, phase };
}

export function tunnelingTransmission({ energyEv = 4, barrierEv = 8, widthNm = 0.6, massRatio = 1 } = {}) {
  const energy = Math.max(0, finite(energyEv)) * ELECTRON_VOLT;
  const barrier = Math.max(0, finite(barrierEv)) * ELECTRON_VOLT;
  const width = Math.max(0, finite(widthNm)) * 1e-9;
  const mass = positive(massRatio) * ELECTRON_MASS;
  if (barrier <= 0 || width <= 0) return { transmission: 1, reflection: 0, kappa: 0, regime: 'free' };
  if (energy >= barrier) {
    const mismatch = Math.pow((Math.sqrt(energy) - Math.sqrt(Math.max(energy - barrier, 0))) / (Math.sqrt(energy) + Math.sqrt(Math.max(energy - barrier, 0)) || 1), 2);
    const transmission = clamp(1 - mismatch, 0, 1);
    return { transmission, reflection: 1 - transmission, kappa: 0, regime: 'above-barrier' };
  }
  const kappa = Math.sqrt(2 * mass * (barrier - energy)) / HBAR;
  const transmission = clamp(Math.exp(-2 * kappa * width), 0, 1);
  return { transmission, reflection: 1 - transmission, kappa, regime: 'tunneling' };
}

export function doubleSlitIntensity({ angleRad = 0, wavelength = 550e-9, slitSeparation = 1e-4, slitWidth = 2e-5 } = {}) {
  const angle = finite(angleRad);
  const lambda = positive(wavelength, 550e-9);
  const alpha = Math.PI * positive(slitWidth) * Math.sin(angle) / lambda;
  const beta = Math.PI * positive(slitSeparation) * Math.sin(angle) / lambda;
  const envelope = Math.abs(alpha) < 1e-10 ? 1 : Math.pow(Math.sin(alpha) / alpha, 2);
  return clamp(envelope * Math.pow(Math.cos(beta), 2), 0, 1);
}

export function timeDilation({ coordinateTime = 1, beta = 0 } = {}) {
  const gamma = lorentzFactor({ beta });
  return { properTime: finite(coordinateTime) / gamma, coordinateTime: finite(coordinateTime), gamma };
}

export function lengthContraction({ properLength = 1, beta = 0 } = {}) {
  const gamma = lorentzFactor({ beta });
  return { contractedLength: finite(properLength) / gamma, properLength: finite(properLength), gamma };
}

export function relativisticJourney({ distanceLy = 4.37, beta = 0.8 } = {}) {
  const safeBeta = clamp(Math.abs(finite(beta)), 1e-9, 0.999999999);
  const gamma = lorentzFactor({ beta: safeBeta });
  const earthYears = Math.abs(finite(distanceLy)) / safeBeta;
  return { earthYears, travelerYears: earthYears / gamma, gamma, distanceLy: Math.abs(finite(distanceLy)), beta: safeBeta };
}

export function relativisticKineticEnergy({ massKg = 1, beta = 0 } = {}) {
  const gamma = lorentzFactor({ beta });
  return { energy: (gamma - 1) * positive(massKg) * C * C, gamma };
}

export function schwarzschildRadius({ massKg, solarMasses } = {}) {
  const mass = massKg == null ? positive(solarMasses, 1) * SOLAR_MASS : positive(massKg);
  return 2 * G * mass / (C * C);
}

export function gravitationalTimeDilation({ massKg, solarMasses = 1, radiusM, radiusInRs = 6 } = {}) {
  const mass = massKg == null ? positive(solarMasses) * SOLAR_MASS : positive(massKg);
  const rs = schwarzschildRadius({ massKg: mass });
  const radius = Math.max(rs * 1.000001, radiusM == null ? positive(radiusInRs, 6) * rs : positive(radiusM));
  const factor = Math.sqrt(Math.max(0, 1 - rs / radius));
  return { factor, radius, schwarzschildRadius: rs, coordinatePerProper: factor > 0 ? 1 / factor : Infinity };
}

export function gravitationalDeflection({ massKg, solarMasses = 1, impactParameterM, impactInRs = 8 } = {}) {
  const mass = massKg == null ? positive(solarMasses) * SOLAR_MASS : positive(massKg);
  const rs = schwarzschildRadius({ massKg: mass });
  const impact = impactParameterM == null ? positive(impactInRs, 8) * rs : positive(impactParameterM);
  const angleRad = 4 * G * mass / (impact * C * C);
  return { angleRad, angleDegrees: angleRad * 180 / Math.PI, angleArcseconds: angleRad * 180 / Math.PI * 3600, impact, schwarzschildRadius: rs };
}

export function blackHoleProperties({ solarMasses = 10, orbitRadiusRs = 6 } = {}) {
  const mass = positive(solarMasses, 10) * SOLAR_MASS;
  const rs = schwarzschildRadius({ massKg: mass });
  const orbitRadius = Math.max(3.01 * rs, positive(orbitRadiusRs, 6) * rs);
  const orbitalPeriod = 2 * Math.PI * Math.sqrt(Math.pow(orbitRadius, 3) / (G * mass));
  const time = gravitationalTimeDilation({ massKg: mass, radiusM: orbitRadius });
  return {
    mass,
    schwarzschildRadius: rs,
    photonSphereRadius: 1.5 * rs,
    iscoRadius: 3 * rs,
    orbitRadius,
    orbitalPeriod,
    timeFactor: time.factor,
  };
}

export function enclosedExponentialDiskMass({ radiusKpc = 8, diskMassSolar = 6e10, scaleLengthKpc = 3 } = {}) {
  const radius = Math.max(0, finite(radiusKpc));
  const scale = positive(scaleLengthKpc, 3);
  const x = radius / scale;
  return positive(diskMassSolar, 6e10) * (1 - Math.exp(-x) * (1 + x));
}

export function galaxyRotationCurve({ radiusKpc = 8, diskMassSolar = 6e10, scaleLengthKpc = 3, haloVelocityKmS = 190, haloCoreKpc = 4 } = {}) {
  const radius = Math.max(0.05, finite(radiusKpc, 8));
  const radiusM = radius * KILOPARSEC;
  const luminousMass = enclosedExponentialDiskMass({ radiusKpc: radius, diskMassSolar, scaleLengthKpc }) * SOLAR_MASS;
  const luminousVelocity = Math.sqrt(G * luminousMass / radiusM);
  const asymptotic = Math.max(0, finite(haloVelocityKmS, 190)) * 1000;
  const haloVelocity = asymptotic * radius / Math.sqrt(radius * radius + positive(haloCoreKpc, 4) ** 2);
  const totalVelocity = Math.sqrt(luminousVelocity ** 2 + haloVelocity ** 2);
  const effectiveMass = totalVelocity ** 2 * radiusM / G;
  const haloMass = Math.max(0, effectiveMass - luminousMass);
  return {
    radiusKpc: radius,
    luminousVelocity,
    haloVelocity,
    totalVelocity,
    luminousMass,
    haloMass,
    haloFraction: effectiveMass > 0 ? haloMass / effectiveMass : 0,
  };
}

export function spacetimeInterval({ deltaTimeNs = 10, deltaX = 0, deltaY = 0, deltaZ = 0 } = {}) {
  const dt = finite(deltaTimeNs) * 1e-9;
  const distance = Math.hypot(finite(deltaX), finite(deltaY), finite(deltaZ));
  const ct = C * Math.abs(dt);
  const intervalSquared = (C * dt) ** 2 - distance ** 2;
  const tolerance = Math.max(1e-12, Math.max(ct * ct, distance * distance) * 1e-9);
  const classification = Math.abs(intervalSquared) <= tolerance ? 'lightlike' : intervalSquared > 0 ? 'timelike' : 'spacelike';
  return {
    deltaTime: dt,
    distance,
    lightTravelDistance: ct,
    intervalSquared,
    classification,
    causallyReachable: classification !== 'spacelike',
    requiredSpeed: Math.abs(dt) > 0 ? distance / Math.abs(dt) : Infinity,
  };
}

export function lightConeRadius({ timeNs = 10 } = {}) {
  return C * Math.abs(finite(timeNs)) * 1e-9;
}

export function calculateAdvancedExperiment(mode, params = {}) {
  switch (mode) {
    case 'quantum': {
      const beta = clamp(finite(params.speedPercentC, 5) / 100, 0.000001, 0.99);
      const wave = deBroglieWavelength({ massKg: ELECTRON_MASS * positive(params.massRatio, 1), speed: C * beta });
      const tunnel = tunnelingTransmission({
        energyEv: params.energyEv,
        barrierEv: params.barrierEv,
        widthNm: params.barrierWidthNm,
        massRatio: params.massRatio,
      });
      return { mode, beta, wave, tunnel };
    }
    case 'relativity': {
      const beta = clamp(finite(params.beta, 0.8), 0, 0.9999);
      const journey = relativisticJourney({ distanceLy: params.distanceLy, beta });
      const contraction = lengthContraction({ properLength: params.properLength, beta });
      const dilation = timeDilation({ coordinateTime: params.coordinateTime, beta });
      return { mode, beta, journey, contraction, dilation };
    }
    case 'darkMatter':
      return { mode, curve: galaxyRotationCurve({
        radiusKpc: params.radiusKpc,
        diskMassSolar: positive(params.diskMassBillion, 60) * 1e9,
        scaleLengthKpc: params.scaleLengthKpc,
        haloVelocityKmS: params.haloVelocityKmS,
        haloCoreKpc: params.haloCoreKpc,
      }) };
    case 'blackHole': {
      const properties = blackHoleProperties({ solarMasses: params.blackHoleMassSolar, orbitRadiusRs: params.orbitRadiusRs });
      const deflection = gravitationalDeflection({ solarMasses: params.blackHoleMassSolar, impactInRs: params.impactInRs });
      return { mode, properties, deflection };
    }
    case 'timeTravel':
      return { mode, interval: spacetimeInterval({ deltaTimeNs: params.deltaTimeNs, deltaX: params.deltaX, deltaY: params.deltaY, deltaZ: params.deltaZ }) };
    default:
      return calculateAdvancedExperiment('quantum', params);
  }
}
