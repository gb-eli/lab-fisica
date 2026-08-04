export const METER_MODES = Object.freeze({
  VOLTAGE_DC: 'voltage-dc',
  CURRENT_DC: 'current-dc',
  RESISTANCE: 'resistance',
  CONTINUITY: 'continuity',
});

export const METER_JACKS = Object.freeze({
  VOLT_OHM: 'v-ohm',
  CURRENT: 'amp',
});

export const PROBE_PLACEMENTS = Object.freeze({
  DISCONNECTED: 'disconnected',
  SOURCE_PARALLEL: 'source-parallel',
  LOAD_PARALLEL: 'load-parallel',
  SERIES: 'series',
  COMPONENT: 'component',
});

export const LOAD_TYPES = Object.freeze({
  RESISTOR: 'resistor',
  LAMP: 'lamp',
  LED: 'led',
  DIODE: 'diode',
  RHEOSTAT: 'rheostat',
});

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function fuseTripTime(ratio) {
  if (ratio <= 1.15) return Infinity;
  if (ratio <= 1.5) return 18;
  if (ratio <= 2) return 7;
  if (ratio <= 4) return 1.6;
  return 0.22;
}

function effectiveLoad({ loadType, resistance, rheostatResistance, polarity = 'forward' }) {
  const R = Math.max(0.05, Number(resistance) || 0.05);
  const rheostat = Math.max(0, Number(rheostatResistance) || 0);
  switch (loadType) {
    case LOAD_TYPES.LED:
      return { resistance: R + rheostat, forwardVoltage: polarity === 'forward' ? 2.05 : Infinity, label: 'LED' };
    case LOAD_TYPES.DIODE:
      return { resistance: R + rheostat, forwardVoltage: polarity === 'forward' ? 0.72 : Infinity, label: 'Diodo' };
    case LOAD_TYPES.LAMP:
      return { resistance: Math.max(1, R * 0.72) + rheostat, forwardVoltage: 0, label: 'Lâmpada' };
    case LOAD_TYPES.RHEOSTAT:
      return { resistance: R + rheostat, forwardVoltage: 0, label: 'Reostato' };
    default:
      return { resistance: R + rheostat, forwardVoltage: 0, label: 'Resistor' };
  }
}

function instrumentTolerance(value, percent, digits, resolution) {
  const uncertainty = Math.abs(value) * percent / 100 + digits * resolution;
  return { value, uncertainty, min: value - uncertainty, max: value + uncertainty };
}

function readingText(value, unit, decimals = 3) {
  if (!Number.isFinite(value)) return 'OL';
  const abs = Math.abs(value);
  if (unit === 'A' && abs < 1) return `${(value * 1000).toFixed(1)} mA`;
  if (unit === 'Ω' && abs >= 1000) return `${(value / 1000).toFixed(2)} kΩ`;
  return `${value.toFixed(decimals)} ${unit}`;
}

export function evaluateElectricalLab(config = {}) {
  const sourceVoltage = clamp(Number(config.sourceVoltage) || 0, 0, 30);
  const currentLimit = clamp(Number(config.currentLimit) || 0.5, 0.02, 5);
  const duration = Math.max(0, Number(config.duration) || 0);
  const switchClosed = config.switchClosed === true;
  const wiringValid = config.wiringValid !== false;
  const circuitFuseRating = clamp(Number(config.circuitFuseRating) || 0.5, 0.05, 5);
  const circuitFuseIntact = config.circuitFuseIntact !== false;
  const meterFuseIntact = config.meterFuseIntact !== false;
  const meterMode = config.meterMode || METER_MODES.VOLTAGE_DC;
  const meterJack = config.meterJack || METER_JACKS.VOLT_OHM;
  const probePlacement = config.probePlacement || PROBE_PLACEMENTS.DISCONNECTED;
  const load = effectiveLoad(config);
  const internalResistance = 0.18;

  const faults = [];
  let shortByMeter = false;
  if (meterMode === METER_MODES.CURRENT_DC && meterJack === METER_JACKS.CURRENT &&
      [PROBE_PLACEMENTS.SOURCE_PARALLEL, PROBE_PLACEMENTS.LOAD_PARALLEL].includes(probePlacement)) {
    shortByMeter = true;
    faults.push({ code: 'meter-parallel-short', severity: 'danger', message: 'Multímetro em corrente foi ligado em paralelo. O fusível interno protege o instrumento.' });
  }
  if ([METER_MODES.RESISTANCE, METER_MODES.CONTINUITY].includes(meterMode) && switchClosed && sourceVoltage > 0 && probePlacement !== PROBE_PLACEMENTS.DISCONNECTED) {
    faults.push({ code: 'ohm-energized', severity: 'danger', message: 'Medição de resistência/continuidade em circuito energizado é inválida e perigosa.' });
  }
  if (meterMode === METER_MODES.VOLTAGE_DC && meterJack === METER_JACKS.CURRENT && probePlacement !== PROBE_PLACEMENTS.DISCONNECTED) {
    faults.push({ code: 'wrong-jack-voltage', severity: 'danger', message: 'Ponta vermelha no borne A durante medição de tensão.' });
    shortByMeter = true;
  }
  if (meterMode === METER_MODES.CURRENT_DC && meterJack !== METER_JACKS.CURRENT) {
    faults.push({ code: 'wrong-jack-current', severity: 'attention', message: 'Medição de corrente exige o borne A e ligação em série.' });
  }

  const circuitAvailable = switchClosed && wiringValid && circuitFuseIntact;
  const forwardAvailable = Number.isFinite(load.forwardVoltage) && sourceVoltage > load.forwardVoltage;
  const effectiveResistance = shortByMeter ? 0.16 : load.resistance + internalResistance;
  const requestedCurrent = circuitAvailable && (load.forwardVoltage === 0 || forwardAvailable)
    ? Math.max(0, (sourceVoltage - (Number.isFinite(load.forwardVoltage) ? load.forwardVoltage : 0)) / effectiveResistance)
    : 0;
  const sourceMode = requestedCurrent > currentLimit ? 'CC' : 'CV';
  let current = sourceMode === 'CC' ? currentLimit : requestedCurrent;
  if (!meterFuseIntact && meterMode === METER_MODES.CURRENT_DC && probePlacement === PROBE_PLACEMENTS.SERIES) current = 0;
  const outputVoltage = current > 0 ? Math.min(sourceVoltage, current * effectiveResistance + (Number.isFinite(load.forwardVoltage) ? load.forwardVoltage : 0)) : sourceVoltage;
  const loadVoltage = current > 0 ? Math.max(0, outputVoltage - (Number.isFinite(load.forwardVoltage) ? load.forwardVoltage : 0)) : 0;
  const loadPower = current * current * load.resistance;
  const sourcePower = outputVoltage * current;
  const thermalRise = loadPower * 20 * (1 - Math.exp(-duration / 42));
  const temperature = clamp(24 + thermalRise, 24, 230);

  const fuseRatio = circuitFuseRating > 0 ? current / circuitFuseRating : Infinity;
  const circuitFuseWillBlow = circuitFuseIntact && current > 0 && duration >= fuseTripTime(fuseRatio);
  const meterFuseWillBlow = meterFuseIntact && shortByMeter && sourceVoltage > 0 && duration >= 0.18;
  if (sourceMode === 'CC' && current > 0) faults.push({ code: 'source-current-limit', severity: 'attention', message: 'A fonte entrou em modo CC para limitar a corrente.' });
  if (circuitFuseWillBlow) faults.push({ code: 'circuit-fuse-trip', severity: 'danger', message: `O fusível de ${circuitFuseRating.toFixed(2)} A abriu o circuito.` });
  if (meterFuseWillBlow) faults.push({ code: 'meter-fuse-trip', severity: 'danger', message: 'O fusível interno do multímetro foi aberto.' });
  if (!wiringValid) faults.push({ code: 'wiring-open', severity: 'attention', message: 'O caminho elétrico principal está incompleto.' });
  if (load.forwardVoltage === Infinity && switchClosed) faults.push({ code: 'reverse-polarity', severity: 'measurement', message: `${load.label} polarizado reversamente: corrente praticamente nula no modelo.` });
  if (temperature > 110) faults.push({ code: 'overheat', severity: 'danger', message: 'Temperatura elevada no componente de carga.' });

  const instrument = evaluateMultimeter({
    meterMode, meterJack, probePlacement, meterFuseIntact: meterFuseIntact && !meterFuseWillBlow,
    switchClosed, sourceVoltage, outputVoltage, loadVoltage, current, resistance: load.resistance,
  });

  return {
    sourceVoltage,
    currentLimit,
    sourceMode,
    outputVoltage,
    current: circuitFuseWillBlow ? 0 : current,
    requestedCurrent,
    resistance: load.resistance,
    loadVoltage,
    loadPower: circuitFuseWillBlow ? 0 : loadPower,
    sourcePower: circuitFuseWillBlow ? 0 : sourcePower,
    energy: circuitFuseWillBlow ? 0 : sourcePower * duration,
    temperature,
    load,
    faults,
    instrument,
    circuitFuseWillBlow,
    meterFuseWillBlow,
    shortByMeter,
    circuitAvailable,
  };
}

export function evaluateMultimeter({
  meterMode, meterJack, probePlacement, meterFuseIntact = true,
  switchClosed, sourceVoltage, outputVoltage, loadVoltage, current, resistance,
}) {
  if (!meterFuseIntact && meterMode === METER_MODES.CURRENT_DC) {
    return { text: 'FUSE', unit: '', state: 'danger', message: 'Fusível interno aberto.', numeric: NaN, uncertainty: NaN, beep: false };
  }
  if (probePlacement === PROBE_PLACEMENTS.DISCONNECTED) {
    return { text: '— — — —', unit: '', state: 'idle', message: 'Pontas de prova desconectadas.', numeric: NaN, uncertainty: NaN, beep: false };
  }

  if (meterMode === METER_MODES.VOLTAGE_DC) {
    if (meterJack !== METER_JACKS.VOLT_OHM) return { text: 'FUSE', state: 'danger', message: 'Borne incorreto para tensão.', numeric: NaN, uncertainty: NaN, beep: false };
    if (![PROBE_PLACEMENTS.SOURCE_PARALLEL, PROBE_PLACEMENTS.LOAD_PARALLEL].includes(probePlacement)) return { text: 'OL', state: 'attention', message: 'Voltímetro deve ser ligado em paralelo.', numeric: NaN, uncertainty: NaN, beep: false };
    const value = probePlacement === PROBE_PLACEMENTS.SOURCE_PARALLEL ? outputVoltage : loadVoltage;
    const tolerance = instrumentTolerance(value, 0.5, 2, 0.01);
    return { text: readingText(value, 'V', 2), state: 'measurement', message: `Precisão ±(${0.5}% + 2 dígitos): ±${tolerance.uncertainty.toFixed(3)} V`, numeric: value, ...tolerance, beep: false };
  }

  if (meterMode === METER_MODES.CURRENT_DC) {
    if (meterJack !== METER_JACKS.CURRENT) return { text: 'OL', state: 'attention', message: 'Use o borne A para corrente.', numeric: NaN, uncertainty: NaN, beep: false };
    if (probePlacement !== PROBE_PLACEMENTS.SERIES) return { text: 'FUSE', state: 'danger', message: 'Amperímetro deve ser ligado em série.', numeric: NaN, uncertainty: NaN, beep: false };
    const tolerance = instrumentTolerance(current, 1.0, 3, 0.001);
    return { text: readingText(current, 'A', 3), state: 'measurement', message: `Precisão ±(1,0% + 3 dígitos): ±${(tolerance.uncertainty * 1000).toFixed(1)} mA`, numeric: current, ...tolerance, beep: false };
  }

  if ([METER_MODES.RESISTANCE, METER_MODES.CONTINUITY].includes(meterMode)) {
    if (meterJack !== METER_JACKS.VOLT_OHM) return { text: 'OL', state: 'attention', message: 'Use o borne VΩ.', numeric: NaN, uncertainty: NaN, beep: false };
    if (switchClosed && sourceVoltage > 0) return { text: 'LIVE', state: 'danger', message: 'Desenergize o circuito antes da medição.', numeric: NaN, uncertainty: NaN, beep: false };
    if (probePlacement !== PROBE_PLACEMENTS.COMPONENT) return { text: 'OL', state: 'attention', message: 'Conecte as pontas diretamente ao componente isolado.', numeric: NaN, uncertainty: NaN, beep: false };
    const tolerance = instrumentTolerance(resistance, 0.8, 2, 0.1);
    const beep = meterMode === METER_MODES.CONTINUITY && resistance <= 50;
    return {
      text: meterMode === METER_MODES.CONTINUITY ? (beep ? 'BEEP' : 'OPEN') : readingText(resistance, 'Ω', 1),
      state: beep ? 'success' : 'measurement',
      message: meterMode === METER_MODES.CONTINUITY ? (beep ? 'Continuidade detectada abaixo de 50 Ω.' : 'Resistência acima do limiar de continuidade.') : `Precisão ±(0,8% + 2 dígitos): ±${tolerance.uncertainty.toFixed(2)} Ω`,
      numeric: resistance, ...tolerance, beep,
    };
  }

  return { text: 'OL', state: 'attention', message: 'Função não reconhecida.', numeric: NaN, uncertainty: NaN, beep: false };
}
