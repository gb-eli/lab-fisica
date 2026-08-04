const EPS = 1e-12;
const SIGMA = 5.670374419e-8;
const R = 8.314462618;
const G0 = 9.80665;

const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const positive = (value, fallback = 0) => Math.max(EPS, finite(value, fallback));
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function celsiusToKelvin(celsius) { return finite(celsius) + 273.15; }
export function kelvinToCelsius(kelvin) { return finite(kelvin) - 273.15; }

export function sensibleHeat({ mass = 1, specificHeat = 4186, initialTemperature = 20, finalTemperature = 30 } = {}) {
  const m = Math.max(0, finite(mass, 1));
  const c = Math.max(0, finite(specificHeat, 4186));
  const deltaTemperature = finite(finalTemperature) - finite(initialTemperature);
  return { mass: m, specificHeat: c, deltaTemperature, heat: m * c * deltaTemperature };
}

export function calorimetryEquilibrium({ bodies = [], environmentHeatCapacity = 0, environmentTemperature = 20 } = {}) {
  const normalized = bodies.map((body) => ({
    mass: Math.max(0, finite(body.mass)),
    specificHeat: Math.max(0, finite(body.specificHeat)),
    temperature: finite(body.temperature),
  }));
  const capacities = normalized.map((body) => body.mass * body.specificHeat);
  const envCapacity = Math.max(0, finite(environmentHeatCapacity));
  const totalCapacity = capacities.reduce((sum, value) => sum + value, 0) + envCapacity;
  const weighted = normalized.reduce((sum, body, index) => sum + capacities[index] * body.temperature, 0)
    + envCapacity * finite(environmentTemperature);
  const equilibriumTemperature = totalCapacity > EPS ? weighted / totalCapacity : finite(environmentTemperature);
  const exchanges = normalized.map((body, index) => capacities[index] * (equilibriumTemperature - body.temperature));
  return {
    equilibriumTemperature,
    totalHeatCapacity: totalCapacity,
    exchanges,
    energyBalance: exchanges.reduce((sum, value) => sum + value, 0) + envCapacity * (equilibriumTemperature - finite(environmentTemperature)),
  };
}

export function latentHeat({ mass = 1, latentHeat = 334000, direction = 'absorb' } = {}) {
  const magnitude = Math.max(0, finite(mass, 1)) * Math.max(0, finite(latentHeat, 334000));
  return { heat: direction === 'release' ? -magnitude : magnitude, magnitude, direction };
}

export function linearExpansion({ initialLength = 1, coefficient = 12e-6, deltaTemperature = 10 } = {}) {
  const length = Math.max(0, finite(initialLength, 1));
  const deltaLength = length * finite(coefficient, 12e-6) * finite(deltaTemperature, 10);
  return { initialLength: length, deltaLength, finalLength: length + deltaLength };
}

export function conduction({ conductivity = 1, area = 1, hotTemperature = 100, coldTemperature = 20, thickness = 0.1 } = {}) {
  const k = Math.max(0, finite(conductivity, 1));
  const A = Math.max(0, finite(area, 1));
  const L = positive(thickness, 0.1);
  const deltaTemperature = finite(hotTemperature) - finite(coldTemperature);
  return { heatRate: k * A * deltaTemperature / L, thermalResistance: k > EPS && A > EPS ? L / (k * A) : Infinity, deltaTemperature };
}

export function convection({ coefficient = 10, area = 1, surfaceTemperature = 60, fluidTemperature = 20 } = {}) {
  const h = Math.max(0, finite(coefficient, 10));
  const A = Math.max(0, finite(area, 1));
  const deltaTemperature = finite(surfaceTemperature) - finite(fluidTemperature);
  return { heatRate: h * A * deltaTemperature, deltaTemperature };
}

export function radiation({ emissivity = 0.9, area = 1, surfaceTemperatureC = 80, surroundingsTemperatureC = 20 } = {}) {
  const e = clamp(finite(emissivity, 0.9), 0, 1);
  const A = Math.max(0, finite(area, 1));
  const surfaceTemperatureK = positive(celsiusToKelvin(surfaceTemperatureC));
  const surroundingsTemperatureK = positive(celsiusToKelvin(surroundingsTemperatureC));
  const heatRate = e * SIGMA * A * (surfaceTemperatureK ** 4 - surroundingsTemperatureK ** 4);
  return { heatRate, surfaceTemperatureK, surroundingsTemperatureK };
}

export function phaseChangeWater({ mass = 1, initialTemperature = -10, suppliedHeat = 0 } = {}) {
  const m = positive(mass, 1);
  let energy = finite(suppliedHeat);
  let temperature = finite(initialTemperature, -10);
  let solidFraction = temperature <= 0 ? 1 : 0;
  let liquidFraction = temperature > 0 && temperature < 100 ? 1 : 0;
  let vaporFraction = temperature >= 100 ? 1 : 0;
  const C_ICE = 2100;
  const C_WATER = 4186;
  const C_STEAM = 2010;
  const LF = 334000;
  const LV = 2256000;

  function heatStage(required, onComplete, onPartial) {
    if (energy >= required) { energy -= required; onComplete(); return true; }
    onPartial(energy / Math.max(required, EPS)); energy = 0; return false;
  }

  if (temperature < 0 && energy > 0) {
    const required = m * C_ICE * (0 - temperature);
    if (!heatStage(required, () => { temperature = 0; }, (fraction) => { temperature += (0 - temperature) * fraction; })) {
      return { temperature, solidFraction: 1, liquidFraction: 0, vaporFraction: 0, remainingHeat: energy, stage: 'solid-heating' };
    }
  }
  if (temperature <= 0 && solidFraction > 0 && energy > 0) {
    const required = m * LF;
    if (!heatStage(required, () => { solidFraction = 0; liquidFraction = 1; }, (fraction) => { solidFraction = 1 - fraction; liquidFraction = fraction; temperature = 0; })) {
      return { temperature: 0, solidFraction, liquidFraction, vaporFraction: 0, remainingHeat: energy, stage: 'melting' };
    }
  }
  if (temperature < 100 && liquidFraction > 0 && energy > 0) {
    const required = m * C_WATER * (100 - temperature);
    if (!heatStage(required, () => { temperature = 100; }, (fraction) => { temperature += (100 - temperature) * fraction; })) {
      return { temperature, solidFraction: 0, liquidFraction: 1, vaporFraction: 0, remainingHeat: energy, stage: 'liquid-heating' };
    }
  }
  if (temperature <= 100 && liquidFraction > 0 && energy > 0) {
    const required = m * LV;
    if (!heatStage(required, () => { liquidFraction = 0; vaporFraction = 1; }, (fraction) => { liquidFraction = 1 - fraction; vaporFraction = fraction; temperature = 100; })) {
      return { temperature: 100, solidFraction: 0, liquidFraction, vaporFraction, remainingHeat: energy, stage: 'boiling' };
    }
  }
  if (vaporFraction > 0 && energy > 0) temperature = 100 + energy / (m * C_STEAM);
  return { temperature, solidFraction, liquidFraction, vaporFraction, remainingHeat: Math.max(0, energy), stage: vaporFraction ? 'steam-heating' : liquidFraction ? 'liquid' : 'solid' };
}

export function idealGasState({ moles = 1, temperatureC = 20, volume = 0.024 } = {}) {
  const n = Math.max(0, finite(moles, 1));
  const temperatureK = positive(celsiusToKelvin(temperatureC));
  const V = positive(volume, 0.024);
  const pressure = n * R * temperatureK / V;
  return { moles: n, temperatureK, temperatureC: kelvinToCelsius(temperatureK), volume: V, pressure, pressureKPa: pressure / 1000 };
}

export function gasProcess({ type = 'isothermal', initialPressure = 101325, initialVolume = 0.024, initialTemperatureC = 20, finalVolume = 0.012, finalPressure = 202650, gamma = 1.4 } = {}) {
  const P1 = positive(initialPressure, 101325);
  const V1 = positive(initialVolume, 0.024);
  const T1 = positive(celsiusToKelvin(initialTemperatureC));
  let P2 = positive(finalPressure, P1);
  let V2 = positive(finalVolume, V1);
  let T2 = T1;
  if (type === 'isothermal') { P2 = P1 * V1 / V2; T2 = T1; }
  else if (type === 'isobaric') { P2 = P1; T2 = T1 * V2 / V1; }
  else if (type === 'isochoric') { V2 = V1; T2 = T1 * P2 / P1; }
  else if (type === 'adiabatic') { P2 = P1 * (V1 / V2) ** finite(gamma, 1.4); T2 = T1 * (V1 / V2) ** (finite(gamma, 1.4) - 1); }
  const work = type === 'isothermal' ? P1 * V1 * Math.log(V2 / V1)
    : type === 'isobaric' ? P1 * (V2 - V1)
      : type === 'isochoric' ? 0
        : (P2 * V2 - P1 * V1) / (1 - finite(gamma, 1.4));
  return { type, initialPressure: P1, initialVolume: V1, initialTemperatureK: T1, finalPressure: P2, finalVolume: V2, finalTemperatureK: T2, finalTemperatureC: kelvinToCelsius(T2), work };
}

export function hydrostaticPressure({ density = 1000, depth = 1, atmosphericPressure = 101325, gravity = G0 } = {}) {
  const gaugePressure = Math.max(0, finite(density, 1000)) * Math.max(0, finite(gravity, G0)) * Math.max(0, finite(depth, 1));
  return { gaugePressure, absolutePressure: finite(atmosphericPressure, 101325) + gaugePressure };
}

export function buoyancy({ fluidDensity = 1000, displacedVolume = 0.001, objectMass = 0.5, gravity = G0 } = {}) {
  const rho = Math.max(0, finite(fluidDensity, 1000));
  const volume = Math.max(0, finite(displacedVolume, 0.001));
  const g = Math.max(0, finite(gravity, G0));
  const buoyantForce = rho * volume * g;
  const weight = Math.max(0, finite(objectMass, 0.5)) * g;
  const netForce = buoyantForce - weight;
  return { buoyantForce, weight, netForce, state: Math.abs(netForce) < 1e-8 ? 'neutral' : netForce > 0 ? 'rising' : 'sinking', equilibriumSubmergedFraction: rho > EPS && volume > EPS ? clamp(finite(objectMass, 0.5) / (rho * volume), 0, 1) : 1 };
}

export function continuity({ area1 = 0.01, velocity1 = 1, area2 = 0.005 } = {}) {
  const A1 = positive(area1, 0.01);
  const A2 = positive(area2, 0.005);
  const v1 = finite(velocity1, 1);
  const flowRate = A1 * v1;
  return { flowRate, velocity2: flowRate / A2 };
}

export function bernoulli({ pressure1 = 200000, velocity1 = 1, height1 = 0, velocity2 = 4, height2 = 0, density = 1000, gravity = G0 } = {}) {
  const rho = positive(density, 1000);
  const g = Math.max(0, finite(gravity, G0));
  const totalHead = finite(pressure1, 200000) + 0.5 * rho * finite(velocity1, 1) ** 2 + rho * g * finite(height1);
  const pressure2 = totalHead - 0.5 * rho * finite(velocity2, 4) ** 2 - rho * g * finite(height2);
  return { pressure2, totalHead, dynamicPressure1: 0.5 * rho * finite(velocity1, 1) ** 2, dynamicPressure2: 0.5 * rho * finite(velocity2, 4) ** 2 };
}

export function torricelli({ depth = 1, gravity = G0 } = {}) {
  const velocity = Math.sqrt(2 * Math.max(0, finite(gravity, G0)) * Math.max(0, finite(depth, 1)));
  return { velocity };
}

export function reynoldsNumber({ density = 1000, velocity = 1, diameter = 0.01, viscosity = 0.001 } = {}) {
  const value = Math.max(0, finite(density, 1000)) * Math.abs(finite(velocity, 1)) * Math.max(0, finite(diameter, 0.01)) / positive(viscosity, 0.001);
  return { reynolds: value, regime: value < 2300 ? 'laminar' : value > 4000 ? 'turbulent' : 'transition' };
}

export function poiseuilleFlow({ pressureDrop = 1000, radius = 0.005, length = 1, viscosity = 0.001 } = {}) {
  const r = Math.max(0, finite(radius, 0.005));
  const L = positive(length, 1);
  const mu = positive(viscosity, 0.001);
  return { flowRate: Math.PI * finite(pressureDrop, 1000) * r ** 4 / (8 * mu * L) };
}

export function heatEngine({ hotTemperatureC = 500, coldTemperatureC = 30, heatInput = 1000, actualEfficiency = null } = {}) {
  const hotK = positive(celsiusToKelvin(hotTemperatureC));
  const coldK = positive(celsiusToKelvin(coldTemperatureC));
  const carnotEfficiency = clamp(1 - coldK / hotK, 0, 1);
  const efficiency = actualEfficiency == null ? carnotEfficiency * 0.55 : clamp(finite(actualEfficiency), 0, carnotEfficiency);
  const input = Math.max(0, finite(heatInput, 1000));
  const work = input * efficiency;
  return { hotK, coldK, carnotEfficiency, efficiency, work, rejectedHeat: input - work };
}

export function refrigerator({ coldTemperatureC = 4, hotTemperatureC = 30, workInput = 500, actualCop = null } = {}) {
  const coldK = positive(celsiusToKelvin(coldTemperatureC));
  const hotK = positive(celsiusToKelvin(hotTemperatureC));
  const carnotCop = coldK / Math.max(hotK - coldK, EPS);
  const cop = actualCop == null ? carnotCop * 0.45 : clamp(finite(actualCop), 0, carnotCop);
  const work = Math.max(0, finite(workInput, 500));
  const removedHeat = cop * work;
  return { coldK, hotK, carnotCop, cop, work, removedHeat, rejectedHeat: removedHeat + work };
}

export const constants = Object.freeze({ SIGMA, R, G0 });
