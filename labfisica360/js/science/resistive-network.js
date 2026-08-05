const EPSILON = 1e-9;

function finitePositive(value, fallback = 100) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > EPSILON ? parsed : fallback;
}

function gaussianSolve(matrix, vector) {
  const n = vector.length;
  const a = matrix.map((row, index) => [...row, vector[index]]);
  for (let pivot = 0; pivot < n; pivot += 1) {
    let best = pivot;
    for (let row = pivot + 1; row < n; row += 1) if (Math.abs(a[row][pivot]) > Math.abs(a[best][pivot])) best = row;
    if (Math.abs(a[best][pivot]) < EPSILON) throw new Error('Rede singular ou desconectada.');
    [a[pivot], a[best]] = [a[best], a[pivot]];
    const divisor = a[pivot][pivot];
    for (let column = pivot; column <= n; column += 1) a[pivot][column] /= divisor;
    for (let row = 0; row < n; row += 1) {
      if (row === pivot) continue;
      const factor = a[row][pivot];
      if (Math.abs(factor) < EPSILON) continue;
      for (let column = pivot; column <= n; column += 1) a[row][column] -= factor * a[pivot][column];
    }
  }
  return a.map((row) => row[n]);
}

export const CIRCUIT_TEMPLATES = Object.freeze({
  SERIES: 'series',
  PARALLEL: 'parallel',
  MIXED: 'mixed',
});

export const MODEL_MODES = Object.freeze({
  IDEAL: 'ideal',
  REALISTIC: 'realistic',
  EXPERIMENTAL: 'experimental',
});

export function createTemplateNetwork(template = CIRCUIT_TEMPLATES.SERIES, values = [100, 220, 330]) {
  const [r1, r2, r3] = values.map((value) => finitePositive(value));
  if (template === CIRCUIT_TEMPLATES.PARALLEL) {
    return {
      nodes: ['V+', 'GND'],
      resistors: [
        { id: 'R1', from: 'V+', to: 'GND', resistance: r1 },
        { id: 'R2', from: 'V+', to: 'GND', resistance: r2 },
      ],
    };
  }
  if (template === CIRCUIT_TEMPLATES.MIXED) {
    return {
      nodes: ['V+', 'N1', 'GND'],
      resistors: [
        { id: 'R1', from: 'V+', to: 'N1', resistance: r1 },
        { id: 'R2', from: 'N1', to: 'GND', resistance: r2 },
        { id: 'R3', from: 'N1', to: 'GND', resistance: r3 },
      ],
    };
  }
  return {
    nodes: ['V+', 'N1', 'GND'],
    resistors: [
      { id: 'R1', from: 'V+', to: 'N1', resistance: r1 },
      { id: 'R2', from: 'N1', to: 'GND', resistance: r2 },
    ],
  };
}

function modeAdjustments(mode, resistors, ambientTemperature = 24) {
  if (mode === MODEL_MODES.IDEAL) return resistors.map((resistor) => ({ ...resistor, effectiveResistance: resistor.resistance }));
  const contactResistance = mode === MODEL_MODES.EXPERIMENTAL ? 0.18 : 0.08;
  const toleranceScale = mode === MODEL_MODES.EXPERIMENTAL ? 0.03 : 0.01;
  return resistors.map((resistor, index) => {
    const deterministicTolerance = ((index * 37 + resistor.id.charCodeAt(0)) % 9 - 4) / 4 * toleranceScale;
    const nominal = resistor.resistance * (1 + deterministicTolerance);
    const temperatureCoefficient = 0.0004;
    const effectiveResistance = nominal * (1 + temperatureCoefficient * (ambientTemperature - 20)) + contactResistance;
    return { ...resistor, nominalResistance: nominal, effectiveResistance };
  });
}

export function solveResistiveNetwork({
  sourceVoltage = 12,
  currentLimit = Infinity,
  network = createTemplateNetwork(),
  modelMode = MODEL_MODES.REALISTIC,
  ambientTemperature = 24,
} = {}) {
  const voltage = Math.max(0, Number(sourceVoltage) || 0);
  const limit = Number.isFinite(Number(currentLimit)) ? Math.max(0, Number(currentLimit)) : Infinity;
  const adjusted = modeAdjustments(modelMode, network.resistors || [], ambientTemperature);
  const knownVoltages = new Map([['GND', 0], ['V+', voltage]]);
  const allNodes = new Set(['GND', 'V+']);
  adjusted.forEach((resistor) => { allNodes.add(resistor.from); allNodes.add(resistor.to); });
  const unknownNodes = [...allNodes].filter((node) => !knownVoltages.has(node));
  const nodeIndex = new Map(unknownNodes.map((node, index) => [node, index]));
  const matrix = Array.from({ length: unknownNodes.length }, () => Array(unknownNodes.length).fill(0));
  const vector = Array(unknownNodes.length).fill(0);

  for (const resistor of adjusted) {
    const resistance = finitePositive(resistor.effectiveResistance, resistor.resistance);
    const conductance = 1 / resistance;
    const fromUnknown = nodeIndex.has(resistor.from);
    const toUnknown = nodeIndex.has(resistor.to);
    if (fromUnknown) {
      const row = nodeIndex.get(resistor.from);
      matrix[row][row] += conductance;
      if (toUnknown) matrix[row][nodeIndex.get(resistor.to)] -= conductance;
      else vector[row] += conductance * (knownVoltages.get(resistor.to) ?? 0);
    }
    if (toUnknown) {
      const row = nodeIndex.get(resistor.to);
      matrix[row][row] += conductance;
      if (fromUnknown) matrix[row][nodeIndex.get(resistor.from)] -= conductance;
      else vector[row] += conductance * (knownVoltages.get(resistor.from) ?? 0);
    }
  }

  let solved = [];
  let disconnected = false;
  try { solved = unknownNodes.length ? gaussianSolve(matrix, vector) : []; }
  catch { disconnected = true; solved = unknownNodes.map(() => 0); }
  unknownNodes.forEach((node, index) => knownVoltages.set(node, solved[index]));

  const branchResults = adjusted.map((resistor) => {
    const fromVoltage = knownVoltages.get(resistor.from) ?? 0;
    const toVoltage = knownVoltages.get(resistor.to) ?? 0;
    const resistance = finitePositive(resistor.effectiveResistance, resistor.resistance);
    const branchVoltage = fromVoltage - toVoltage;
    const current = branchVoltage / resistance;
    const power = current * current * resistance;
    return {
      ...resistor,
      resistance,
      fromVoltage,
      toVoltage,
      voltage: branchVoltage,
      current,
      power,
    };
  });

  const requestedCurrent = branchResults
    .filter((branch) => branch.from === 'V+' || branch.to === 'V+')
    .reduce((sum, branch) => sum + (branch.from === 'V+' ? branch.current : -branch.current), 0);
  const sourceMode = requestedCurrent > limit + EPSILON ? 'CC' : 'CV';
  const currentScale = sourceMode === 'CC' && requestedCurrent > EPSILON ? limit / requestedCurrent : 1;
  const outputVoltage = voltage * currentScale;
  const branches = branchResults.map((branch) => ({
    ...branch,
    voltage: branch.voltage * currentScale,
    current: branch.current * currentScale,
    power: branch.power * currentScale * currentScale,
  }));
  const totalCurrent = disconnected ? 0 : requestedCurrent * currentScale;
  const equivalentResistance = totalCurrent > EPSILON ? outputVoltage / totalCurrent : Infinity;
  const totalPower = outputVoltage * totalCurrent;
  const maxBranchPower = Math.max(0, ...branches.map((branch) => branch.power));
  const shortCircuit = Number.isFinite(equivalentResistance) && equivalentResistance < 0.5;

  return {
    modelMode,
    sourceMode,
    programmedVoltage: voltage,
    outputVoltage,
    currentLimit: limit,
    requestedCurrent,
    totalCurrent,
    equivalentResistance,
    totalPower,
    nodeVoltages: Object.fromEntries(knownVoltages),
    branches,
    disconnected,
    shortCircuit,
    maxBranchPower,
  };
}

export function summarizeNetwork(solution) {
  return {
    sourceMode: solution.sourceMode,
    outputVoltage: solution.outputVoltage,
    totalCurrent: solution.totalCurrent,
    equivalentResistance: solution.equivalentResistance,
    totalPower: solution.totalPower,
    branches: solution.branches.map(({ id, resistance, voltage, current, power }) => ({ id, resistance, voltage, current, power })),
  };
}
