const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));
const round = (value, digits = 6) => Number(Number(value).toFixed(digits));

export const DEFAULT_LOADS = Object.freeze([
  { id: 'lighting', label: 'Iluminação', room: 'Sala e quartos', power: 180, powerFactor: 0.98, circuit: 'lighting', hours: 5 },
  { id: 'fridge', label: 'Geladeira', room: 'Cozinha', power: 220, powerFactor: 0.86, circuit: 'kitchen', hours: 10 },
  { id: 'microwave', label: 'Micro-ondas', room: 'Cozinha', power: 1450, powerFactor: 0.96, circuit: 'kitchen', hours: 0.35 },
  { id: 'computer', label: 'Computador', room: 'Escritório', power: 360, powerFactor: 0.92, circuit: 'outlets', hours: 6 },
  { id: 'washer', label: 'Lavadora', room: 'Lavanderia', power: 900, powerFactor: 0.82, circuit: 'outlets', hours: 1.2 },
  { id: 'aircon', label: 'Ar-condicionado', room: 'Quarto', power: 1450, powerFactor: 0.88, circuit: 'hvac', hours: 7 },
  { id: 'shower', label: 'Chuveiro', room: 'Banheiro', power: 5500, powerFactor: 1, circuit: 'shower', hours: 0.45 },
]);

export const CIRCUITS = Object.freeze({
  lighting: { label: 'Iluminação', breaker: 10, cableMm2: 1.5, resistanceOhm: 0.36 },
  outlets: { label: 'Tomadas gerais', breaker: 20, cableMm2: 2.5, resistanceOhm: 0.24 },
  kitchen: { label: 'Cozinha', breaker: 25, cableMm2: 4, resistanceOhm: 0.16 },
  hvac: { label: 'Climatização', breaker: 20, cableMm2: 2.5, resistanceOhm: 0.22 },
  shower: { label: 'Chuveiro', breaker: 32, cableMm2: 6, resistanceOhm: 0.1 },
});

export function loadElectricalState(load, voltage = 127) {
  const activePower = Math.max(0, Number(load.power) || 0);
  const powerFactor = clamp(load.powerFactor ?? 1, 0.1, 1);
  const current = voltage > 0 ? activePower / (voltage * powerFactor) : 0;
  const apparentPower = voltage * current;
  const reactivePower = Math.sqrt(Math.max(0, apparentPower ** 2 - activePower ** 2));
  return { ...load, activePower, apparentPower, reactivePower, current, powerFactor };
}

export function circuitProtectionState({ current, breaker, resistanceOhm = 0.2, ambient = 25, leakageMa = 0, drThresholdMa = 30 }) {
  const loadRatio = breaker > 0 ? current / breaker : Infinity;
  const cableLoss = current ** 2 * resistanceOhm;
  const temperature = ambient + cableLoss * 1.65 + Math.max(0, loadRatio - 0.8) * 18;
  const breakerTrip = loadRatio >= 1.12 || temperature >= 82;
  const overload = loadRatio >= 0.8;
  const drTrip = leakageMa >= drThresholdMa;
  return {
    current, breaker, loadRatio, cableLoss, temperature, leakageMa, drThresholdMa,
    overload, breakerTrip, drTrip,
    state: drTrip ? 'dr-trip' : breakerTrip ? 'breaker-trip' : overload ? 'warning' : 'normal',
  };
}

export function solarGeneration({ ratedKw = 4.4, irradiance = 850, cellTemperature = 42, shading = 0.08, inverterEfficiency = 0.96 }) {
  const thermalFactor = clamp(1 - Math.max(0, cellTemperature - 25) * 0.004, 0.65, 1.04);
  const dcKw = ratedKw * clamp(irradiance / 1000, 0, 1.25) * thermalFactor * (1 - clamp(shading, 0, 0.95));
  const acKw = dcKw * clamp(inverterEfficiency, 0.5, 1);
  return { ratedKw, irradiance, cellTemperature, shading, thermalFactor, dcKw, acKw, lossesKw: dcKw - acKw };
}

export function windGeneration({ windSpeed = 7, rotorRadius = 1.5, airDensity = 1.225, cp = 0.4, generatorEfficiency = 0.88, ratedKw = 3 }) {
  const sweptArea = Math.PI * rotorRadius ** 2;
  const availableKw = 0.5 * airDensity * sweptArea * Math.max(0, windSpeed) ** 3 / 1000;
  const mechanicalKw = availableKw * clamp(cp, 0, 0.593);
  const electricalKw = Math.min(ratedKw, mechanicalKw * clamp(generatorEfficiency, 0, 1));
  return { windSpeed, sweptArea, availableKw, mechanicalKw, electricalKw, ratedKw, curtailedKw: Math.max(0, mechanicalKw * generatorEfficiency - ratedKw) };
}

export function batteryDispatch({ capacityKwh = 10, soc = 0.55, requestedKw = 0, hours = 1, chargeEfficiency = 0.94, dischargeEfficiency = 0.94, maxPowerKw = 5 }) {
  const stored = clamp(soc, 0, 1) * capacityKwh;
  let actualKw = clamp(requestedKw, -maxPowerKw, maxPowerKw);
  let nextStored = stored;
  if (actualKw >= 0) {
    actualKw = Math.min(actualKw, stored * dischargeEfficiency / Math.max(hours, 1e-6));
    nextStored -= actualKw * hours / dischargeEfficiency;
  } else {
    const chargeKw = Math.min(-actualKw, (capacityKwh - stored) / (Math.max(hours, 1e-6) * chargeEfficiency));
    actualKw = -chargeKw;
    nextStored += chargeKw * hours * chargeEfficiency;
  }
  const nextSoc = capacityKwh > 0 ? clamp(nextStored / capacityKwh, 0, 1) : 0;
  return { capacityKwh, soc: clamp(soc, 0, 1), requestedKw, actualKw, nextSoc, storedKwh: nextStored, state: actualKw > 0.01 ? 'discharging' : actualKw < -0.01 ? 'charging' : 'idle' };
}

export function distributionState({ loadKw = 8, generationKw = 0, voltage = 127, powerFactor = 0.92, lineLengthKm = 0.8, conductorResistanceOhmKm = 0.36, transformerEfficiency = 0.96 }) {
  const netKw = loadKw - generationKw;
  const current = Math.abs(netKw) * 1000 / Math.max(1, voltage * clamp(powerFactor, 0.1, 1));
  const lineResistance = Math.max(0, lineLengthKm) * Math.max(0, conductorResistanceOhmKm);
  const lineLossKw = current ** 2 * lineResistance / 1000;
  const voltageDrop = current * lineResistance;
  const deliveredVoltage = Math.max(0, voltage - voltageDrop);
  const transformerLossKw = Math.abs(netKw) * (1 - clamp(transformerEfficiency, 0.5, 1));
  return { netKw, direction: netKw >= 0 ? 'import' : 'export', current, lineResistance, lineLossKw, voltageDrop, deliveredVoltage, transformerLossKw, totalLossKw: lineLossKw + transformerLossKw };
}

export function householdEnergyState({
  voltage = 127,
  loads = DEFAULT_LOADS,
  enabled = Object.fromEntries(DEFAULT_LOADS.map((item) => [item.id, true])),
  leakageMa = 4,
  tariff = 0.92,
  solar = {},
  wind = {},
  battery = {},
  ambient = 27,
} = {}) {
  const activeLoads = loads.filter((load) => enabled[load.id] !== false).map((load) => loadElectricalState(load, voltage));
  const branches = {};
  Object.entries(CIRCUITS).forEach(([key, config]) => {
    const branchLoads = activeLoads.filter((load) => load.circuit === key);
    const current = branchLoads.reduce((sum, load) => sum + load.current, 0);
    const branchLeakage = leakageMa * (branchLoads.length / Math.max(1, activeLoads.length));
    branches[key] = { ...config, loads: branchLoads, ...circuitProtectionState({ current, breaker: config.breaker, resistanceOhm: config.resistanceOhm, ambient, leakageMa: branchLeakage }) };
  });
  const loadKw = activeLoads.reduce((sum, load) => sum + load.activePower, 0) / 1000;
  const dailyKwh = activeLoads.reduce((sum, load) => sum + load.activePower * Math.max(0, load.hours || 0) / 1000, 0);
  const solarState = solarGeneration(solar);
  const windState = windGeneration(wind);
  const renewableKw = solarState.acKw + windState.electricalKw;
  const balanceBeforeBattery = loadKw - renewableKw;
  const requestedBatteryKw = Number.isFinite(battery.requestedKw) ? battery.requestedKw : clamp(balanceBeforeBattery, -3, 3);
  const batteryState = batteryDispatch({ ...battery, requestedKw: requestedBatteryKw });
  const gridKw = balanceBeforeBattery - batteryState.actualKw;
  const mainCurrent = Math.abs(gridKw) * 1000 / Math.max(1, voltage * 0.94);
  const mainProtection = circuitProtectionState({ current: activeLoads.reduce((sum, load) => sum + load.current, 0), breaker: 63, resistanceOhm: 0.06, ambient, leakageMa });
  const monthlyKwh = dailyKwh * 30;
  const monthlyCost = monthlyKwh * Math.max(0, tariff);
  const selfConsumption = renewableKw > 0 ? Math.min(1, loadKw / renewableKw) : 0;
  return {
    voltage, activeLoads, branches, loadKw, dailyKwh, monthlyKwh, tariff, monthlyCost,
    leakageMa, mainProtection, solar: solarState, wind: windState, battery: batteryState,
    renewableKw, gridKw, gridDirection: gridKw >= 0 ? 'import' : 'export', mainCurrent,
    selfConsumption, critical: mainProtection.drTrip || mainProtection.breakerTrip || Object.values(branches).some((branch) => branch.breakerTrip || branch.drTrip),
  };
}

export function energySnapshot(input) {
  const house = householdEnergyState(input);
  const network = distributionState({ loadKw: house.loadKw, generationKw: house.renewableKw + Math.max(0, house.battery.actualKw), voltage: input?.voltage ?? 127, lineLengthKm: input?.lineLengthKm ?? 0.8, conductorResistanceOhmKm: input?.conductorResistanceOhmKm ?? 0.36, transformerEfficiency: input?.transformerEfficiency ?? 0.96 });
  return JSON.parse(JSON.stringify({ house, network }, (key, value) => typeof value === 'number' ? round(value) : value));
}
