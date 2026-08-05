import assert from 'node:assert/strict';
import { evaluateElectricalLab, METER_MODES, METER_JACKS, PROBE_PLACEMENTS, LOAD_TYPES } from '../js/science/electrical-instruments.js';

const base = {
  sourceVoltage: 12, currentLimit: 2, resistance: 100, rheostatResistance: 0, duration: 1,
  switchClosed: true, wiringValid: true, circuitFuseRating: 1, circuitFuseIntact: true, meterFuseIntact: true,
  loadType: LOAD_TYPES.RESISTOR, polarity: 'forward', meterMode: METER_MODES.VOLTAGE_DC,
  meterJack: METER_JACKS.VOLT_OHM, probePlacement: PROBE_PLACEMENTS.LOAD_PARALLEL,
};

const ohm = evaluateElectricalLab(base);
assert.ok(Math.abs(ohm.current - 12 / 100.18) < 1e-6, 'Corrente deve seguir a resistência total do modelo.');
assert.equal(ohm.sourceMode, 'CV');
assert.equal(ohm.instrument.state, 'measurement');
assert.ok(ohm.instrument.text.includes('V'));

const limited = evaluateElectricalLab({ ...base, resistance: 1, currentLimit: .25 });
assert.equal(limited.sourceMode, 'CC');
assert.equal(limited.current, .25);
assert.ok(limited.faults.some((fault) => fault.code === 'source-current-limit'));

const ammeter = evaluateElectricalLab({ ...base, meterMode: METER_MODES.CURRENT_DC, meterJack: METER_JACKS.CURRENT, probePlacement: PROBE_PLACEMENTS.SERIES });
assert.equal(ammeter.instrument.state, 'measurement');
assert.ok(ammeter.instrument.text.includes('mA'));

const short = evaluateElectricalLab({ ...base, meterMode: METER_MODES.CURRENT_DC, meterJack: METER_JACKS.CURRENT, probePlacement: PROBE_PLACEMENTS.SOURCE_PARALLEL, duration: 1 });
assert.equal(short.shortByMeter, true);
assert.equal(short.meterFuseWillBlow, true);
assert.ok(short.faults.some((fault) => fault.code === 'meter-parallel-short'));

const liveOhm = evaluateElectricalLab({ ...base, meterMode: METER_MODES.RESISTANCE, probePlacement: PROBE_PLACEMENTS.COMPONENT });
assert.equal(liveOhm.instrument.state, 'danger');
assert.equal(liveOhm.instrument.text, 'LIVE');

const continuity = evaluateElectricalLab({ ...base, sourceVoltage: 0, switchClosed: false, resistance: 20, meterMode: METER_MODES.CONTINUITY, probePlacement: PROBE_PLACEMENTS.COMPONENT });
assert.equal(continuity.instrument.beep, true);
assert.equal(continuity.instrument.text, 'BEEP');

const reverseLed = evaluateElectricalLab({ ...base, loadType: LOAD_TYPES.LED, polarity: 'reverse' });
assert.equal(reverseLed.current, 0);
assert.ok(reverseLed.faults.some((fault) => fault.code === 'reverse-polarity'));

const blown = evaluateElectricalLab({ ...base, resistance: 1, currentLimit: 2, circuitFuseRating: .2, duration: 3 });
assert.equal(blown.circuitFuseWillBlow, true);
assert.ok(blown.faults.some((fault) => fault.code === 'circuit-fuse-trip'));

console.log('✓ Instrumentação elétrica: CV/CC, multímetro, fusíveis, continuidade, polaridade e falhas validados.');
