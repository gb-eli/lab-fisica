import { icon } from '../ui/icons.js';
import { createRenderRuntime } from '../render/runtime.js';
import { createOrbitController } from '../render/orbit-controller.js';
import { AssetManager } from '../assets/asset-manager.js';
import { CommandHistory, captureTransform, applyTransform } from '../interaction/command-history.js';
import { SnapSystem } from '../interaction/snap-system.js';
import { ConnectionManager } from '../interaction/connection-manager.js';
import { createInteractionManager } from '../interaction/interaction-manager.js';
import { saveExperiment, loadExperiment } from '../storage.js';
import {
  evaluateElectricalLab, METER_MODES, METER_JACKS, PROBE_PLACEMENTS, LOAD_TYPES,
} from '../science/electrical-instruments.js';
import {
  CIRCUIT_TEMPLATES, MODEL_MODES, createTemplateNetwork, solveResistiveNetwork, summarizeNetwork,
} from '../science/resistive-network.js';

function format(value, unit) {
  if (!Number.isFinite(value)) return '—';
  const abs = Math.abs(value);
  if (abs >= 1000) return `${(value / 1000).toFixed(2)} k${unit}`;
  if (abs < 1 && abs !== 0) return `${(value * 1000).toFixed(1)} m${unit}`;
  return `${value.toFixed(2)} ${unit}`;
}

function createDisplay(THREE, width = 512, height = 180) {
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const context = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  function draw(lines, accent = '#72efff', warning = false) {
    context.clearRect(0, 0, width, height);
    const gradient = context.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, warning ? '#26100d' : '#071a1d'); gradient.addColorStop(1, '#020708');
    context.fillStyle = gradient; context.fillRect(0, 0, width, height);
    context.strokeStyle = warning ? 'rgba(255,112,78,.48)' : 'rgba(93,240,255,.24)'; context.lineWidth = 4; context.strokeRect(5, 5, width - 10, height - 10);
    context.font = '700 62px ui-monospace, monospace'; context.fillStyle = warning ? '#ff8b6a' : accent; context.textAlign = 'center';
    context.shadowBlur = 18; context.shadowColor = warning ? '#ff522f' : accent;
    context.fillText(lines[0] || '', width / 2, 80);
    context.shadowBlur = 0; context.font = '600 27px ui-monospace, monospace'; context.fillStyle = '#a5c7cd';
    context.fillText(lines[1] || '', width / 2, 132);
    texture.needsUpdate = true;
  }
  draw(['0.00', 'STANDBY']);
  return { texture, draw, dispose: () => texture.dispose() };
}

function connectionHas(serialized, a, b) {
  return serialized.some((edge) => (edge.from === a && edge.to === b) || (edge.from === b && edge.to === a));
}

async function createBenchScene({ container, statusElement, getSettings, onSelect, onReady, getState, history, onFeedback, onMode, onWiringChange }) {
  const runtime = await createRenderRuntime({
    container, statusElement, getSettings, canvasClass: 'electrical-bench-webgl',
    camera: { fov: 43, near: .05, far: 80 },
    scene: { background: 0x03070b, fogDensity: .016, fogColor: 0x050c12, exposure: 1.2 },
    environment: { accent: '#4ccfff', background: false, upper: '#1c4053', lower: '#02070b' },
  });
  if (!runtime) return null;
  const { THREE, scene, camera, renderer, materials } = runtime;
  const assets = new AssetManager({ THREE, renderer, materials });
  try { await assets.initialize(); } catch (error) { runtime.dispose(); throw error; }

  const hemi = new THREE.HemisphereLight(0x9fe4ff, 0x081016, 1.42); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xd9f5ff, 4.4);
  key.position.set(4.5, 8, 5.5); key.castShadow = true;
  key.shadow.mapSize.set(1536, 1536); key.shadow.camera.left = -7; key.shadow.camera.right = 7; key.shadow.camera.top = 7; key.shadow.camera.bottom = -7;
  scene.add(key);
  const rim = new THREE.SpotLight(0x3cc8ff, 20, 16, Math.PI / 5, .55, 1.5);
  rim.position.set(-5, 6, -5); rim.target.position.set(0, 1.8, 0); scene.add(rim, rim.target);
  const warm = new THREE.PointLight(0xffbc70, 10, 10, 2); warm.position.set(0, 5.3, 1.5); scene.add(warm);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), materials.polymer(0x071017, { roughness: .82 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(18, 8), materials.coatedMetal(0x0b1b25, { roughness: .42 }));
  backWall.position.set(0, 4, -4.2); scene.add(backWall);
  for (let index = -5; index <= 5; index += 1) {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(.035, 6.8, .035), materials.emissive(index % 2 ? 0x1c6d8c : 0x37c9ff, { emissiveIntensity: .48 }));
    strip.position.set(index * 1.2, 3.7, -4.12); scene.add(strip);
  }

  const ids = ['workbench', 'power-supply', 'multimeter', 'resistor-module', 'toggle-switch', 'lamp-load', 'ammeter', 'voltmeter', 'fuse-module', 'rheostat', 'diode-module', 'led-module'];
  const loaded = await Promise.all(ids.map((id) => assets.load(id)));
  const objects = Object.fromEntries(ids.map((id, index) => [id, loaded[index]]));
  objects['network-r2'] = await assets.load('resistor-module');
  objects['network-r3'] = await assets.load('resistor-module');
  objects['resistor-module'].userData.componentId = 'network-r1';
  objects['network-r2'].userData.componentId = 'network-r2';
  objects['network-r3'].userData.componentId = 'network-r3';
  const componentRoot = new THREE.Group(); componentRoot.name = 'INTERACTIVE_ELECTRICAL_COMPONENTS'; scene.add(componentRoot);
  const defaults = {
    workbench: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
    'power-supply': { position: [-1.62, 2.12, -.34], rotation: [0, .04, 0], scale: [.88, .88, .88] },
    ammeter: { position: [-1.62, 2.12, .55], rotation: [0, .05, 0], scale: [.68, .68, .68] },
    'fuse-module': { position: [-.83, 2.13, .58], rotation: [0, 0, 0], scale: [.72, .72, .72] },
    'resistor-module': { position: [-.50, 2.14, -.18], rotation: [0, 0, 0], scale: [.72, .72, .72] },
    rheostat: { position: [.36, 2.13, -.18], rotation: [0, 0, 0], scale: [.67, .67, .67] },
    'toggle-switch': { position: [.15, 2.12, .62], rotation: [0, 0, 0], scale: [.62, .62, .62] },
    'lamp-load': { position: [1.20, 2.13, -.27], rotation: [0, 0, 0], scale: [.70, .70, .70] },
    voltmeter: { position: [1.22, 2.12, .56], rotation: [0, -.04, 0], scale: [.68, .68, .68] },
    multimeter: { position: [2.02, 2.14, .18], rotation: [-.08, -.28, -.05], scale: [.70, .70, .70] },
    'diode-module': { position: [-1.42, 2.94, -.94], rotation: [0, 0, 0], scale: [.58, .58, .58] },
    'led-module': { position: [1.42, 2.94, -.94], rotation: [0, 0, 0], scale: [.58, .58, .58] },
    'network-r2': { position: [0, 2.92, -.88], rotation: [0, 0, 0], scale: [.68, .68, .68] },
    'network-r3': { position: [.78, 2.92, -.88], rotation: [0, 0, 0], scale: [.68, .68, .68] },
  };
  const componentMap = new Map([...ids.map((id) => [id, objects[id]]), ['network-r2', objects['network-r2']], ['network-r3', objects['network-r3']]]);
  for (const [id, object] of componentMap) {
    const value = defaults[id]; object.position.fromArray(value.position); object.rotation.set(...value.rotation); object.scale.fromArray(value.scale);
    componentRoot.add(object);
  }

  const screenPSU = createDisplay(); const screenDMM = createDisplay(); const screenAMM = createDisplay(); const screenVOL = createDisplay();
  const attachDisplay = (root, geometry, position, display) => {
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(...geometry), new THREE.MeshBasicMaterial({ map: display.texture, toneMapped: false }));
    plane.position.fromArray(position); root.add(plane); return plane;
  };
  attachDisplay(objects['power-supply'], [.64, .22], [-.28, .67, .625], screenPSU);
  attachDisplay(objects.multimeter, [.43, .22], [-.12, 1.12, .35], screenDMM);
  attachDisplay(objects.ammeter, [.58, .22], [0, .47, .225], screenAMM);
  attachDisplay(objects.voltmeter, [.58, .22], [0, .47, .225], screenVOL);
  const resistorDisplays = [createDisplay(300, 112), createDisplay(300, 112), createDisplay(300, 112)];
  attachDisplay(objects['resistor-module'], [.42, .15], [0, .48, .27], resistorDisplays[0]);
  attachDisplay(objects['network-r2'], [.42, .15], [0, .48, .27], resistorDisplays[1]);
  attachDisplay(objects['network-r3'], [.42, .15], [0, .48, .27], resistorDisplays[2]);

  const controller = createOrbitController({
    element: renderer.domElement, camera, target: { x: 0, y: 2.48, z: .02 }, yaw: .18, pitch: .22, radius: 7.7,
    minRadius: 3.0, maxRadius: 11.8, minPitch: -.08, maxPitch: .72, heightFactor: .58,
  });
  runtime.bindCameraController(controller);
  const focusMap = Object.fromEntries([...componentMap].map(([id, object]) => [id, { target: { x: object.position.x, y: object.position.y + .42, z: object.position.z }, radius: id === 'workbench' ? 7.7 : 3.15 }]));

  const snapSystem = new SnapSystem(THREE, { distance: .36, angleStep: Math.PI / 12 });
  for (const [id, value] of Object.entries(defaults)) if (id !== 'workbench') snapSystem.register({ id: `slot-${id}`, position: value.position, accepts: [id], label: `posição ${id}` });

  const t = (id, object, local, polarity, capacity = 1) => ({ id, object, local, polarity, capacity });
  const terminals = [
    t('psu-pos', objects['power-supply'], [-.37, .30, .70], 'positive', 3), t('psu-neg', objects['power-supply'], [-.06, .30, .70], 'negative', 3),
    t('fuse-in', objects['fuse-module'], [-.28, .14, .25], 'positive'), t('fuse-out', objects['fuse-module'], [.28, .14, .25], 'positive'),
    t('amm-in', objects.ammeter, [-.25, .16, .25], 'positive'), t('amm-out', objects.ammeter, [.25, .16, .25], 'positive'),
    t('res-in', objects['resistor-module'], [-.35, .16, .25], undefined, 4), t('res-out', objects['resistor-module'], [.35, .16, .25], undefined, 4),
    t('r2-in', objects['network-r2'], [-.35, .16, .25], undefined, 4), t('r2-out', objects['network-r2'], [.35, .16, .25], undefined, 4),
    t('r3-in', objects['network-r3'], [-.35, .16, .25], undefined, 4), t('r3-out', objects['network-r3'], [.35, .16, .25], undefined, 4),
    t('rheo-in', objects.rheostat, [-.35, .16, .25]), t('rheo-out', objects.rheostat, [.35, .16, .25]),
    t('sw-in', objects['toggle-switch'], [-.18, .17, .25]), t('sw-out', objects['toggle-switch'], [.18, .17, .25]),
    t('lamp-in', objects['lamp-load'], [-.18, .13, .25]), t('lamp-out', objects['lamp-load'], [.18, .13, .25]),
    t('vol-in', objects.voltmeter, [-.25, .16, .25]), t('vol-out', objects.voltmeter, [.25, .16, .25]),
    t('dmm-com', objects.multimeter, [-.22, .22, .24], 'negative'), t('dmm-v', objects.multimeter, [0, .22, .24], 'positive'), t('dmm-a', objects.multimeter, [.22, .22, .24], 'positive'),
    t('diode-in', objects['diode-module'], [-.35, .14, .22]), t('diode-out', objects['diode-module'], [.35, .14, .22]),
    t('led-in', objects['led-module'], [-.22, .13, .23]), t('led-out', objects['led-module'], [.22, .13, .23]),
  ];
  const connectionManager = new ConnectionManager(THREE, scene, { terminals, history, onFeedback, onChange: onWiringChange });
  function connectionsForTemplate(template = CIRCUIT_TEMPLATES.SERIES) {
    const fixed = [
      ['psu-pos', 'fuse-in', { color: 0xae2630 }], ['fuse-out', 'amm-in', { color: 0xae2630 }],
      ['sw-out', 'psu-neg', { color: 0x111820, particleColor: 0x75dfff }],
      ['vol-in', 'amm-out', { color: 0xd8424e }], ['vol-out', 'sw-in', { color: 0x111820 }],
      ['dmm-v', 'amm-out', { color: 0xe33b48 }], ['dmm-com', 'sw-in', { color: 0x111820 }],
    ];
    if (template === CIRCUIT_TEMPLATES.PARALLEL) return [
      ...fixed, ['amm-out', 'res-in', { color: 0xa82430 }], ['amm-out', 'r2-in', { color: 0xd04a36 }],
      ['res-out', 'sw-in', { color: 0x111820 }], ['r2-out', 'sw-in', { color: 0x161f27 }],
    ];
    if (template === CIRCUIT_TEMPLATES.MIXED) return [
      ...fixed, ['amm-out', 'res-in', { color: 0xa82430 }], ['res-out', 'r2-in', { color: 0xd04a36 }], ['res-out', 'r3-in', { color: 0xe06432 }],
      ['r2-out', 'sw-in', { color: 0x111820 }], ['r3-out', 'sw-in', { color: 0x161f27 }],
    ];
    return [...fixed, ['amm-out', 'res-in', { color: 0xa82430 }], ['res-out', 'r2-in', { color: 0xd04a36 }], ['r2-out', 'sw-in', { color: 0x111820 }]];
  }
  let baseConnections = connectionsForTemplate(getState().circuitTemplate);
  baseConnections.forEach(([a, b, options]) => connectionManager.addInitial(a, b, options));

  const constraints = Object.fromEntries([...componentMap].map(([id, object]) => [object.userData.componentId || id, id === 'workbench' || ['diode-module', 'led-module'].includes(id)
    ? { x: [object.position.x, object.position.x], y: [object.position.y, object.position.y], z: [object.position.z, object.position.z] }
    : { x: [-2.35, 2.35], y: [2.10, 3.10], z: [-1.05, .98] }]));
  const interaction = createInteractionManager({
    THREE, camera, renderer, scene, controller, objects: [...componentMap.values()], constraints, snapSystem, history, connectionManager,
    onSelection: (object) => onSelect?.(object?.userData.componentId || object?.userData.assetId || null), onTransform: () => onWiringChange?.(connectionManager.serialize()), onFeedback, onMode,
  });

  const findMesh = (root, name) => { const object = root.getObjectByName(name); return object?.isMesh ? object : object?.children?.find((child) => child.isMesh) || object; };
  const voltageKnob = objects['power-supply'].getObjectByName('KNOB_VOLTAGE_MAT_POLYMER_BLACK');
  const currentKnob = objects['power-supply'].getObjectByName('KNOB_CURRENT_MAT_POLYMER_BLACK');
  const switchLever = objects['toggle-switch'].getObjectByName('SW_LEVER_MAT_METAL_BRUSHED');
  const dmmDial = objects.multimeter.getObjectByName('DMM_DIAL_MAT_POLYMER_BLACK');
  const rheoSlider = objects.rheostat.getObjectByName('RHEO_SLIDER_MAT_ORANGE');
  const fuseWire = findMesh(objects['fuse-module'], 'FUSE_WIRE_MAT_METAL_COPPER');
  const bulb = findMesh(objects['lamp-load'], 'LAMP_BULB_MAT_GLASS'); const filament = findMesh(objects['lamp-load'], 'LAMP_FILAMENT_MAT_EMISSIVE_SCREEN');
  const resistorBodies = [
    findMesh(objects['resistor-module'], 'RES_BODY_MAT_CERAMIC'),
    findMesh(objects['network-r2'], 'RES_BODY_MAT_CERAMIC'),
    findMesh(objects['network-r3'], 'RES_BODY_MAT_CERAMIC'),
  ];
  const ledLens = findMesh(objects['led-module'], 'LED_LENS_MAT_GLASS'); const ledEmitter = findMesh(objects['led-module'], 'LED_EMITTER_MAT_RED');

  function setTemplateVisibility(template) {
    objects['resistor-module'].visible = true;
    objects['network-r2'].visible = true;
    objects['network-r3'].visible = template === CIRCUIT_TEMPLATES.MIXED;
    connectionManager.setTerminalEnabled('r3-in', template === CIRCUIT_TEMPLATES.MIXED);
    connectionManager.setTerminalEnabled('r3-out', template === CIRCUIT_TEMPLATES.MIXED);
  }
  function applyCircuitTemplate(template, { preserveHistory = false } = {}) {
    setTemplateVisibility(template);
    baseConnections = connectionsForTemplate(template);
    connectionManager.restore(baseConnections.map(([from, to, options]) => ({ from, to, options })));
    if (!preserveHistory) history.clear();
    onWiringChange?.(connectionManager.serialize());
  }
  setTemplateVisibility(getState().circuitTemplate);

  function circuitComplete(state) {
    const internalEdges = [['amm-in', 'amm-out'], ['res-in', 'res-out'], ['r2-in', 'r2-out'], ['sw-in', 'sw-out'], ['fuse-in', 'fuse-out']];
    if (state.circuitTemplate === CIRCUIT_TEMPLATES.MIXED) internalEdges.push(['r3-in', 'r3-out']);
    if (state.meterMode === METER_MODES.CURRENT_DC && state.meterJack === METER_JACKS.CURRENT && state.probePlacement === PROBE_PLACEMENTS.SERIES) internalEdges.push(['dmm-a', 'dmm-com']);
    return connectionManager.hasElectricalPath('psu-pos', 'psu-neg', internalEdges);
  }

  function syncVisuals(state) {
    const warning = state.faults.some((fault) => fault.severity === 'danger');
    screenPSU.draw([`${state.outputVoltage.toFixed(2)} V`, `${state.I.toFixed(3)} A · ${state.sourceMode}`], state.sourceMode === 'CC' ? '#ffc56d' : '#72efff', state.sourceMode === 'CC');
    screenDMM.draw([state.instrument.text, `${state.meterMode.toUpperCase()} · ${state.meterJack.toUpperCase()}`], state.instrument.state === 'danger' ? '#ff8b6a' : '#72efff', state.instrument.state === 'danger');
    screenAMM.draw([`${(state.I * 1000).toFixed(1)} mA`, state.circuitFuseIntact ? 'SÉRIE' : 'CIRCUITO ABERTO'], '#ff9b7c', !state.circuitFuseIntact);
    screenVOL.draw([`${state.loadVoltage.toFixed(2)} V`, 'PARALELO'], '#72efff', false);
    if (voltageKnob) voltageKnob.rotation.z = -2.1 + state.U / 24 * 4.2;
    if (currentKnob) currentKnob.rotation.z = -1.2 + Math.min(1, state.currentLimit / 2) * 2.4;
    if (switchLever) switchLever.rotation.z = state.closed ? -.02 : -.48;
    if (dmmDial) {
      const dialAngles = { [METER_MODES.VOLTAGE_DC]: -1.3, [METER_MODES.CURRENT_DC]: -.2, [METER_MODES.RESISTANCE]: .85, [METER_MODES.CONTINUITY]: 1.65 };
      dmmDial.rotation.z = dialAngles[state.meterMode] ?? 0;
    }
    if (rheoSlider) rheoSlider.position.x = -.34 + Math.min(1, state.rheostatResistance / 500) * .68;
    if (fuseWire) { fuseWire.visible = state.circuitFuseIntact; if (fuseWire.material) fuseWire.material.emissiveIntensity = state.circuitFuseIntact ? .1 : 0; }
    if (bulb?.material) { const active = state.loadType === LOAD_TYPES.LAMP && state.I > 0; bulb.material.emissive = new THREE.Color(0xffb84b); bulb.material.emissiveIntensity = active ? Math.min(5, .2 + state.P * 1.8) : .02; bulb.material.opacity = active ? .62 : .25; bulb.material.needsUpdate = true; }
    if (filament?.material) filament.material.emissiveIntensity = state.loadType === LOAD_TYPES.LAMP && state.I > 0 ? Math.min(7, .4 + state.P * 2.2) : .1;
    const branches = state.network?.branches || [];
    resistorDisplays.forEach((display, index) => {
      const branch = branches[index];
      const label = `R${index + 1} ${(branch?.resistance ?? state.resistorValues?.[index] ?? 0).toFixed(0)} Ω`;
      const reading = branch ? `${(branch.current * 1000).toFixed(1)} mA · ${branch.voltage.toFixed(2)} V` : 'INATIVO';
      display.draw([label, reading], index === 0 ? '#72efff' : index === 1 ? '#ffbd72' : '#d88cff', false);
      const body = resistorBodies[index];
      if (body?.material) {
        const estimatedTemperature = 24 + Math.min(180, (branch?.power || 0) * 34 * (1 - Math.exp(-Math.max(0, state.duration || 0) / 30)));
        body.material.emissive = new THREE.Color(estimatedTemperature > 90 ? 0xff542d : 0x251008);
        body.material.emissiveIntensity = Math.max(0, (estimatedTemperature - 24) / 82);
      }
    });
    const ledActive = state.loadType === LOAD_TYPES.LED && state.I > 0 && state.polarity === 'forward';
    if (ledLens?.material) { ledLens.material.emissive = new THREE.Color(0xff202d); ledLens.material.emissiveIntensity = ledActive ? Math.min(8, 1 + state.I * 260) : .04; ledLens.material.opacity = ledActive ? .86 : .35; ledLens.material.needsUpdate = true; }
    if (ledEmitter?.material) ledEmitter.material.emissiveIntensity = ledActive ? 6 : .05;
    container.classList.toggle('has-electrical-fault', warning);
  }

  function removeConnectionsUsing(idsToRemove) {
    for (const [key, edge] of [...connectionManager.connections]) if (idsToRemove.some((id) => edge.from === id || edge.to === id)) connectionManager.removeConnection(key, { record: false });
  }
  function removeDirect(a, b) {
    for (const [key, edge] of [...connectionManager.connections]) if ((edge.from === a && edge.to === b) || (edge.from === b && edge.to === a)) connectionManager.removeConnection(key, { record: false });
  }
  function ensureConnection(a, b, options = {}) {
    if (!connectionHas(connectionManager.serialize(), a, b)) connectionManager.addConnection(a, b, options, { record: false });
  }
  function configureMeter({ mode, jack, placement }) {
    removeConnectionsUsing(['dmm-com', 'dmm-v', 'dmm-a']);
    removeDirect('fuse-out', 'amm-in');
    if (placement === PROBE_PLACEMENTS.SERIES && jack === METER_JACKS.CURRENT) {
      ensureConnection('fuse-out', 'dmm-a', { color: 0xae2630 }); ensureConnection('dmm-com', 'amm-in', { color: 0x111820 });
    } else {
      ensureConnection('fuse-out', 'amm-in', { color: 0xae2630 });
      if (placement === PROBE_PLACEMENTS.SOURCE_PARALLEL && jack === METER_JACKS.VOLT_OHM) { ensureConnection('dmm-v', 'psu-pos', { color: 0xe33b48 }); ensureConnection('dmm-com', 'psu-neg', { color: 0x111820 }); }
      if ([PROBE_PLACEMENTS.LOAD_PARALLEL, PROBE_PLACEMENTS.COMPONENT].includes(placement) && jack === METER_JACKS.VOLT_OHM) { ensureConnection('dmm-v', 'amm-out', { color: 0xe33b48 }); ensureConnection('dmm-com', 'sw-in', { color: 0x111820 }); }
    }
    onWiringChange?.(connectionManager.serialize());
  }

  let previousSignature = '';
  runtime.start(({ time }) => {
    controller.update(); interaction.update();
    const state = getState();
    const complete = circuitComplete(state);
    const signature = JSON.stringify([state.U, state.currentLimit, state.R, state.closed, state.temp.toFixed(1), state.meterMode, state.meterJack, state.probePlacement, state.circuitFuseIntact, state.meterFuseIntact, state.circuitTemplate, state.modelMode, state.resistorValues, state.network?.branches?.map((branch) => [branch.voltage.toFixed(4), branch.current.toFixed(6), branch.power.toFixed(5)]), complete]);
    if (signature !== previousSignature) { previousSignature = signature; syncVisuals(state); }
    const speed = Math.max(.05, Math.min(.78, state.I * 3.5));
    connectionManager.update(time, state.closed && complete && state.I > 0, speed);
  });

  function serialize() {
    return { transforms: Object.fromEntries([...componentMap].map(([id, object]) => [id, captureTransform(object)])), connections: connectionManager.serialize(), snapEnabled: snapSystem.enabled };
  }
  function restore(payload = {}) {
    for (const [id, transform] of Object.entries(payload.transforms || {})) if (componentMap.has(id)) applyTransform(componentMap.get(id), transform);
    if (payload.connections) connectionManager.restore(payload.connections);
    snapSystem.setEnabled(payload.snapEnabled !== false); history.clear(); onWiringChange?.(connectionManager.serialize());
  }
  function resetLayout() {
    for (const [id, object] of componentMap) { const value = defaults[id]; object.position.fromArray(value.position); object.rotation.set(...value.rotation); object.scale.fromArray(value.scale); object.updateMatrixWorld(true); }
    connectionManager.restore(baseConnections.map(([from, to, options]) => ({ from, to, options })));
    history.clear(); interaction.select(null); onWiringChange?.(connectionManager.serialize());
  }
  function getMeterTopology() {
    const edges = connectionManager.serialize();
    if (connectionHas(edges, 'fuse-out', 'dmm-a') && connectionHas(edges, 'dmm-com', 'amm-in')) return { jack: METER_JACKS.CURRENT, placement: PROBE_PLACEMENTS.SERIES };
    if (connectionHas(edges, 'dmm-v', 'psu-pos') && connectionHas(edges, 'dmm-com', 'psu-neg')) return { jack: METER_JACKS.VOLT_OHM, placement: PROBE_PLACEMENTS.SOURCE_PARALLEL };
    if (connectionHas(edges, 'dmm-v', 'amm-out') && connectionHas(edges, 'dmm-com', 'sw-in')) return { jack: METER_JACKS.VOLT_OHM, placement: PROBE_PLACEMENTS.LOAD_PARALLEL };
    return { jack: METER_JACKS.VOLT_OHM, placement: PROBE_PLACEMENTS.DISCONNECTED };
  }

  onReady?.({
    focus(id) { const view = focusMap[id]; if (view) { controller.focus(view.target, view.radius); interaction.select(componentMap.get(id)); } },
    resetCamera() { controller.reset(); interaction.select(null); }, setMode: interaction.setMode,
    undo: () => history.undo(), redo: () => history.redo(), setSnap: (value) => snapSystem.setEnabled(value),
    isCircuitComplete: () => circuitComplete(getState()), serialize, restore, resetLayout, configureMeter, getMeterTopology,
    applyCircuitTemplate,
  });

  return () => {
    interaction.dispose(); connectionManager.dispose(); controller.dispose(); [screenPSU, screenDMM, screenAMM, screenVOL, ...resistorDisplays].forEach((display) => display.dispose()); assets.dispose(); runtime.dispose();
  };
}

export function renderOhm(root, { getSettings = () => ({}) } = {}) {
  const shell = document.createElement('section');
  shell.className = 'module-shell electrical-bench-module electrical-bench-module--r2';
  shell.innerHTML = `
    <header class="module-head module-head--focused"><div><span class="badge">Reconstrução R2 · bancada organizada</span><h1>Eletricidade e Circuitos 360°</h1><p>Escolha uma topologia, ajuste fonte e resistores, energize e compare as medições. Ferramentas avançadas continuam disponíveis sem competir com a atividade principal.</p></div><div class="module-head__mission"><small>PERGUNTA CENTRAL</small><strong>Como a topologia altera corrente, tensão e potência?</strong></div></header>
    <div class="lab-grid lab-grid--premium">
      <article class="sim-card bench-scene-card">
        <div class="sim-toolbar bench-toolbar interaction-toolbar" role="toolbar" aria-label="Ferramentas de bancada">
          <button data-switch data-icon="play"><span class="icon-slot"></span><span>Energizar</span></button><span class="toolbar-divider"></span>
          <button data-mode="select" data-icon="select" class="is-active"><span class="icon-slot"></span><span>Selecionar</span></button><button data-mode="move" data-icon="move"><span class="icon-slot"></span><span>Mover</span></button><button data-mode="rotate" data-icon="rotate"><span class="icon-slot"></span><span>Girar</span></button><button data-mode="connect" data-icon="connect"><span class="icon-slot"></span><span>Conectar</span></button><span class="toolbar-divider"></span>
          <button data-undo data-icon="undo" disabled><span class="icon-slot"></span><span>Desfazer</span></button><button data-redo data-icon="redo" disabled><span class="icon-slot"></span><span>Refazer</span></button><button data-reset-camera data-icon="camera"><span class="icon-slot"></span><span>Câmera</span></button><button data-reset data-icon="reset"><span class="icon-slot"></span><span>Restaurar</span></button>
        </div>
        <div class="lab-status-rail bench-status-rail" aria-label="Estado elétrico">
          <span class="status-chip" data-source-mode data-state="success">Fonte CV</span><span class="status-chip" data-template-state data-state="measurement">Série</span><span class="status-chip" data-render-status>Inicializando bancada 3D…</span><span class="status-chip" data-interaction-state data-state="measurement">Modo selecionar</span><span class="status-chip" data-wiring-state data-state="success">Circuito conectado</span><span class="status-chip" data-fuse-state data-state="success">Fusíveis íntegros</span>
        </div>
        <div class="bench-stage" data-bench-stage><div class="bench-fallback" aria-hidden="true"><div class="fallback-instrument">FONTE</div><div class="fallback-wire"></div><div class="fallback-load">R</div><div class="fallback-meter">DMM</div></div><div class="bench-guided-overlay" data-guided-overlay><small>ATIVIDADE ATUAL</small><strong data-guided-title>Corrente em circuito série</strong><p data-guided-message>Escolha a topologia e aplique uma montagem segura.</p><div><span data-guided-step="1" class="is-active">1 Topologia</span><span data-guided-step="2">2 Parâmetros</span><span data-guided-step="3">3 Medição</span></div></div></div>
        <div class="bench-inspector" data-inspector><small>INSPEÇÃO DE COMPONENTE</small><strong>Bancada completa</strong><p>Toque em um equipamento para inspecioná-lo em 360°.</p></div>
        <div class="readout readout--premium readout--instruments">
          <div><small>Saída</small><strong data-read="u"></strong></div><div><small>Corrente</small><strong data-read="i"></strong></div><div><small>R equivalente</small><strong data-read="r"></strong></div><div><small>Potência</small><strong data-read="p"></strong></div><div><small>Temperatura</small><strong data-read="temp"></strong></div><div><small>Multímetro</small><strong data-read="meter"></strong></div>
        </div>
      </article>
      <aside class="control-stack">
        <article class="control-card bench-start-card">
          <div class="card-title-row"><div><small>COMECE AQUI</small><h2>Montagem guiada</h2></div><span data-start-state>Desenergizada</span></div>
          <p>Escolha um circuito pronto. A bancada organiza componentes, cabos e instrumento automaticamente.</p>
          <div class="bench-template-choice" role="group" aria-label="Escolher topologia">
            <button data-guided-template="series" class="is-active"><b>Série</b><small>Mesma corrente</small></button>
            <button data-guided-template="parallel"><b>Paralelo</b><small>Mesma tensão</small></button>
            <button data-guided-template="mixed"><b>Misto</b><small>Lei dos nós</small></button>
          </div>
          <div class="bench-safe-presets" role="group" aria-label="Ajustes seguros da fonte">
            <button data-safe-voltage="6">6 V</button><button data-safe-voltage="12" class="is-active">12 V</button><button data-safe-voltage="18">18 V</button>
          </div>
          <button class="bench-safe-start" data-safe-start type="button"><span>Aplicar montagem segura</span><small>Cabos, multímetro e proteção</small></button>
          <p class="bench-start-feedback" data-start-feedback>Topologia série preparada. Ajuste os valores ou use a montagem segura.</p>
        </article>
        <article class="control-card"><div class="card-title-row"><h2>Fonte CC regulável</h2><span data-source-label>CV</span></div>
          <div class="control"><label>Tensão programada <output data-out="u"></output></label><input data-input="u" type="range" min="0" max="24" value="12" step=".1"></div>
          <div class="control"><label>Limite de corrente <output data-out="limit"></output></label><input data-input="limit" type="range" min=".05" max="2" value=".50" step=".01"></div>
          <div class="control"><label>Tempo energizado <output data-out="t"></output></label><input data-input="t" type="range" min="0" max="60" value="1" step=".1"></div>
        </article>
        <article class="control-card circuit-builder-card"><div class="card-title-row"><h3>Construtor de circuitos</h3><span data-active-components>2 resistores</span></div>
          <label>Topologia<select data-select="template"><option value="series">Série</option><option value="parallel">Paralelo</option><option value="mixed">Misto: R1 + (R2 ∥ R3)</option></select></label>
          <label>Modelo científico<select data-select="model"><option value="ideal">Ideal</option><option value="realistic" selected>Realista</option><option value="experimental">Experimental</option></select></label>
          <div class="template-preset-grid"><button data-template="series">Série</button><button data-template="parallel">Paralelo</button><button data-template="mixed">Misto</button></div>
          <div class="control"><label>R1 <output data-out="r1"></output></label><input data-input="r1" type="range" min="10" max="1000" value="100" step="10"></div>
          <div class="control"><label>R2 <output data-out="r2"></output></label><input data-input="r2" type="range" min="10" max="1000" value="220" step="10"></div>
          <div class="control" data-r3-control><label>R3 <output data-out="r3"></output></label><input data-input="r3" type="range" min="10" max="1000" value="330" step="10"></div>
          <div class="component-catalog"><small>CATÁLOGO 3D</small><div><button data-catalog-action="add">Adicionar ramo</button><button data-catalog-action="duplicate">Duplicar valor</button><button data-catalog-action="remove">Remover ramo</button></div><p data-catalog-status>Dois resistores ativos na bancada.</p></div>
        </article>
        <article class="control-card"><h3>Proteção elétrica</h3>
          <div class="control"><label>Fusível do circuito <output data-out="fuse"></output></label><input data-input="fuse" type="range" min=".1" max="2" value=".50" step=".05"></div>
          <div class="fuse-actions"><button data-reset-circuit-fuse>Substituir fusível do circuito</button><button data-reset-meter-fuse>Substituir fusível do multímetro</button></div>
        </article>
        <article class="control-card branch-card"><div class="card-title-row"><h3>Ramos calculados</h3><span data-network-mode>REALISTA</span></div><div class="branch-table-wrap"><table class="branch-table"><thead><tr><th>Ramo</th><th>R</th><th>U</th><th>I</th><th>P</th></tr></thead><tbody data-branch-rows></tbody></table></div></article>
        <article class="control-card meter-card"><div class="card-title-row"><h3>Multímetro digital</h3><span data-meter-state>STANDBY</span></div>
          <label>Função<select data-select="meter-mode"><option value="voltage-dc">Tensão CC</option><option value="current-dc">Corrente CC</option><option value="resistance">Resistência</option><option value="continuity">Continuidade</option></select></label>
          <label>Borne vermelho<select data-select="meter-jack"><option value="v-ohm">VΩ</option><option value="amp">A</option></select></label>
          <label>Ligação das pontas<select data-select="probe"><option value="load-parallel">Paralelo à carga</option><option value="source-parallel">Paralelo à fonte</option><option value="series">Em série</option><option value="component">Componente isolado</option><option value="disconnected">Desconectadas</option></select></label>
          <button class="meter-wire-button" data-wire-meter>Aplicar ligação guiada em 3D</button>
          <div class="meter-reading" data-meter-reading><strong>— — — —</strong><small>Pontas desconectadas</small></div>
        </article>
        <article class="control-card fault-panel"><div class="card-title-row"><h3>Diagnóstico de segurança</h3><span data-fault-count>0 alertas</span></div><ul data-fault-list><li data-state="success">Montagem segura.</li></ul></article>
        <article class="control-card interaction-card"><div class="card-title-row"><h3>Manipulação universal</h3><span class="interaction-mode-badge" data-mode-badge>Selecionar</span></div>
          <div class="interaction-mode-grid"><button data-mode="select" class="is-active">Selecionar</button><button data-mode="move">Mover</button><button data-mode="rotate">Girar</button><button data-mode="connect">Conectar</button></div>
          <label class="switch compact-switch"><input data-snap-toggle type="checkbox" checked><span>Encaixe magnético e rotação em 15°</span></label><p class="interaction-help" data-interaction-help>Toque em um componente. Atalhos: G, R, C, Ctrl+Z.</p><div class="interaction-feedback" data-feedback data-state="measurement">Sistema pronto.</div>
        </article>
        <article class="control-card component-focus"><h3>Inspeção 360°</h3><div class="component-focus__grid component-focus__grid--dense">
          ${[['power-supply','Fonte'],['multimeter','DMM'],['ammeter','Amperímetro'],['voltmeter','Voltímetro'],['fuse-module','Fusível'],['resistor-module','R1'],['network-r2','R2'],['network-r3','R3'],['rheostat','Reostato'],['toggle-switch','Chave'],['lamp-load','Lâmpada'],['diode-module','Diodo'],['led-module','LED'],['workbench','Bancada']].map(([id,label])=>`<button data-focus="${id}">${label}</button>`).join('')}
        </div></article>
        <article class="control-card history-card"><div class="card-title-row"><h3>Histórico</h3><span data-history-count>0 ações</span></div><ol data-history-list><li>Nenhuma alteração registrada.</li></ol><div class="history-actions"><button data-save-layout data-icon="save"><span class="icon-slot"></span><span>Salvar</span></button><button data-load-layout data-icon="load"><span class="icon-slot"></span><span>Recuperar</span></button></div></article>
        <article class="control-card guided-practice"><div class="card-title-row"><h3>Prática guiada</h3><span data-practice-progress>0/3</span></div><label>Atividade<select data-select="practice"><option value="series-current">Corrente igual em série</option><option value="parallel-voltage">Tensão igual em paralelo</option><option value="mixed-kcl">Lei dos nós no circuito misto</option></select></label><ol data-practice-steps></ol><button data-check-practice>Validar montagem e medidas</button><div data-practice-feedback class="practice-feedback" data-state="measurement">Selecione a prática e siga os passos.</div></article>
        <article class="control-card"><h3>Painel matemático</h3><div class="formula" data-formula></div></article>
        <article class="control-card"><h3>Corrente × tensão</h3><canvas class="chart" data-chart width="500" height="180"></canvas></article>
        <article class="control-card evidence-card"><div class="card-title-row"><h3>Evidência da atividade</h3><span data-evidence-state>Pronta para registrar</span></div><p>Gera um arquivo JSON com topologia, parâmetros, medições, ramos, alertas, prática e histórico da montagem.</p><div class="evidence-actions"><button data-export-evidence>Exportar evidência</button><button data-export-csv>Exportar tabela CSV</button></div></article>
        <div class="note">Simulação educacional com proteção e erros controlados. Não reproduza curtos-circuitos ou medições incorretas em equipamentos reais.</div>
      </aside>
    </div>`;
  root.append(shell);

  const inputs = Object.fromEntries([...shell.querySelectorAll('[data-input]')].map((element) => [element.dataset.input, element]));
  const selects = Object.fromEntries([...shell.querySelectorAll('[data-select]')].map((element) => [element.dataset.select, element]));
  const outs = Object.fromEntries([...shell.querySelectorAll('[data-out]')].map((element) => [element.dataset.out, element]));
  const reads = Object.fromEntries([...shell.querySelectorAll('[data-read]')].map((element) => [element.dataset.read, element]));
  const chart = shell.querySelector('[data-chart]'); const context = chart.getContext('2d');
  let closed = false; let wiringValid = true; let circuitFuseIntact = true; let meterFuseIntact = true; let stageApi = null; let cleanup3d = null; let disposed = false;
  const history = new CommandHistory({ onChange: updateHistoryUi });
  const componentInfo = {
    'power-supply': ['Fonte CC regulável', 'Opera em tensão constante (CV) ou corrente constante (CC), conforme a carga e o limite programado.'],
    multimeter: ['Multímetro digital', 'Funções de tensão, corrente, resistência e continuidade com bornes e fusível interno.'],
    ammeter: ['Amperímetro dedicado', 'Ligado em série, possui baixa resistência interna no modelo.'], voltmeter: ['Voltímetro dedicado', 'Ligado em paralelo, possui alta resistência interna no modelo.'],
    'fuse-module': ['Porta-fusível transparente', 'Abre o caminho quando a sobrecorrente ultrapassa a curva de atuação.'], 'resistor-module': ['Resistor R1', 'Primeiro resistor da rede; dissipa energia por efeito Joule e aquece conforme a potência.'],
    'network-r1': ['Resistor R1', 'Primeiro resistor da rede; seu papel muda conforme a topologia selecionada.'], 'network-r2': ['Resistor R2', 'Segundo resistor tridimensional com leitura individual de tensão, corrente e potência.'], 'network-r3': ['Resistor R3', 'Terceiro ramo liberado no circuito misto para estudar divisão de corrente e Lei dos Nós.'],
    rheostat: ['Reostato deslizante', 'Ajusta continuamente a resistência em série.'], 'toggle-switch': ['Interruptor metálico', 'Abre ou fecha mecanicamente o circuito.'],
    'lamp-load': ['Lâmpada', 'Carga luminosa com aquecimento e brilho dependentes da potência.'], 'diode-module': ['Diodo', 'Conduz no sentido direto após a tensão de limiar e bloqueia no sentido reverso.'],
    'led-module': ['LED', 'Emite luz somente com polaridade direta e corrente limitada.'], workbench: ['Bancada técnica', 'Conjunto modular com instrumentos, proteção, conexões e componentes intercambiáveis.'],
  };

  function resistorValues() { return [Number(inputs.r1.value), Number(inputs.r2.value), Number(inputs.r3.value)]; }
  function rawConfig() {
    const values = resistorValues();
    const template = selects.template.value;
    const previewNetwork = solveResistiveNetwork({
      sourceVoltage: Number(inputs.u.value), currentLimit: Number(inputs.limit.value),
      network: createTemplateNetwork(template, values), modelMode: selects.model.value,
    });
    return {
      sourceVoltage: Number(inputs.u.value), currentLimit: Number(inputs.limit.value), resistance: Number.isFinite(previewNetwork.equivalentResistance) ? previewNetwork.equivalentResistance : 1e9,
      rheostatResistance: 0, duration: Number(inputs.t.value), circuitFuseRating: Number(inputs.fuse.value), circuitFuseIntact, meterFuseIntact,
      switchClosed: closed, wiringValid, loadType: LOAD_TYPES.RESISTOR, polarity: 'forward', meterMode: selects['meter-mode'].value,
      meterJack: selects['meter-jack'].value, probePlacement: selects.probe.value, circuitTemplate: template, modelMode: selects.model.value,
      resistorValues: values,
    };
  }
  function state() {
    const config = rawConfig();
    const active = config.switchClosed && config.wiringValid && config.circuitFuseIntact;
    const network = solveResistiveNetwork({
      sourceVoltage: active ? config.sourceVoltage : 0,
      currentLimit: config.currentLimit,
      network: createTemplateNetwork(config.circuitTemplate, config.resistorValues),
      modelMode: config.modelMode,
    });
    const safety = evaluateElectricalLab(config);
    const faults = [...safety.faults];
    if (network.shortCircuit) faults.push({ code: 'network-short', severity: 'danger', message: 'A resistência equivalente está próxima de um curto-circuito.' });
    if (config.modelMode === MODEL_MODES.EXPERIMENTAL) faults.push({ code: 'experimental-mode', severity: 'measurement', message: 'Modo experimental: tolerâncias, contatos e pequenas variações estão ativos.' });
    const maxTemp = 24 + Math.min(206, network.maxBranchPower * 34 * (1 - Math.exp(-config.duration / 30)));
    const outputVoltage = active ? network.outputVoltage : config.sourceVoltage;
    const current = active ? network.totalCurrent : 0;
    const totalPower = active ? network.totalPower : 0;
    return {
      ...safety,
      faults,
      network,
      U: config.sourceVoltage,
      R: network.equivalentResistance,
      I: current,
      P: totalPower,
      temp: maxTemp,
      temperature: maxTemp,
      outputVoltage,
      loadVoltage: active ? network.outputVoltage : 0,
      loadPower: totalPower,
      sourcePower: totalPower,
      requestedCurrent: network.requestedCurrent,
      energy: totalPower * config.duration,
      sourceMode: active ? network.sourceMode : 'CV',
      closed,
      circuitFuseIntact,
      meterFuseIntact,
      currentLimit: config.currentLimit,
      rheostatResistance: 0,
      loadType: LOAD_TYPES.RESISTOR,
      polarity: 'forward',
      meterMode: config.meterMode,
      meterJack: config.meterJack,
      probePlacement: config.probePlacement,
      circuitTemplate: config.circuitTemplate,
      modelMode: config.modelMode,
      resistorValues: config.resistorValues,
      duration: config.duration,
    };
  }
  function drawChart(U, R, currentLimit) {
    const width = chart.width, height = chart.height; context.clearRect(0, 0, width, height); context.fillStyle = '#071019'; context.fillRect(0, 0, width, height);
    context.strokeStyle = 'rgba(83,216,255,.16)'; context.lineWidth = 1; for (let y = 20; y < height; y += 40) { context.beginPath(); context.moveTo(0, y); context.lineTo(width, y); context.stroke(); }
    context.strokeStyle = '#53d8ff'; context.lineWidth = 3; context.beginPath();
    for (let x = 0; x <= width; x += 4) { const voltage = x / width * 24; const current = Math.min(currentLimit, voltage / Math.max(.1, R)); const y = height - 12 - Math.min(height - 24, current * 300); if (x === 0) context.moveTo(x, y); else context.lineTo(x, y); }
    context.stroke(); context.strokeStyle = '#ffc66d'; context.lineWidth = 2; const x = U / 24 * width; context.beginPath(); context.moveTo(x, 0); context.lineTo(x, height); context.stroke();
  }
  function applyTrips(result) {
    let changed = false;
    if (result.circuitFuseWillBlow && circuitFuseIntact) { circuitFuseIntact = false; changed = true; }
    if (result.meterFuseWillBlow && meterFuseIntact) { meterFuseIntact = false; changed = true; }
    return changed ? state() : result;
  }
  const practiceDefinitions = {
    'series-current': {
      title: 'Corrente igual em série', template: CIRCUIT_TEMPLATES.SERIES,
      steps: ['Selecione a topologia em série.', 'Energize o circuito com dois resistores diferentes.', 'Compare as correntes de R1 e R2.'],
      checks(current) {
        const [a, b] = current.network.branches;
        return [current.circuitTemplate === CIRCUIT_TEMPLATES.SERIES, current.closed && wiringValid, Boolean(a && b && Math.abs(a.current - b.current) < 1e-6)];
      },
    },
    'parallel-voltage': {
      title: 'Tensão igual em paralelo', template: CIRCUIT_TEMPLATES.PARALLEL,
      steps: ['Selecione a topologia em paralelo.', 'Energize os dois ramos.', 'Confirme que R1 e R2 recebem a mesma tensão.'],
      checks(current) {
        const [a, b] = current.network.branches;
        return [current.circuitTemplate === CIRCUIT_TEMPLATES.PARALLEL, current.closed && wiringValid, Boolean(a && b && Math.abs(a.voltage - b.voltage) < 1e-6)];
      },
    },
    'mixed-kcl': {
      title: 'Lei dos nós no circuito misto', template: CIRCUIT_TEMPLATES.MIXED,
      steps: ['Selecione o circuito misto.', 'Energize R1 em série com os ramos R2 e R3.', 'Verifique I₁ = I₂ + I₃ no nó de divisão.'],
      checks(current) {
        const [r1, r2, r3] = current.network.branches;
        return [current.circuitTemplate === CIRCUIT_TEMPLATES.MIXED, current.closed && wiringValid, Boolean(r1 && r2 && r3 && Math.abs(r1.current - r2.current - r3.current) < 1e-6)];
      },
    },
  };

  function updatePracticeUi(current = state()) {
    const definition = practiceDefinitions[selects.practice.value];
    const checks = definition.checks(current);
    shell.querySelector('[data-practice-steps]').innerHTML = definition.steps.map((step, index) => `<li data-state="${checks[index] ? 'success' : 'measurement'}">${checks[index] ? '✓ ' : ''}${step}</li>`).join('');
    shell.querySelector('[data-practice-progress]').textContent = `${checks.filter(Boolean).length}/${checks.length}`;
    return { definition, checks };
  }

  function update() {
    let current = state(); current = applyTrips(current);
    outs.u.textContent = `${Number(inputs.u.value).toFixed(1)} V`;
    outs.limit.textContent = `${Number(inputs.limit.value).toFixed(2)} A`;
    outs.r1.textContent = `${Number(inputs.r1.value).toFixed(0)} Ω`;
    outs.r2.textContent = `${Number(inputs.r2.value).toFixed(0)} Ω`;
    outs.r3.textContent = `${Number(inputs.r3.value).toFixed(0)} Ω`;
    outs.t.textContent = `${Number(inputs.t.value).toFixed(1)} s`;
    outs.fuse.textContent = `${Number(inputs.fuse.value).toFixed(2)} A`;
    reads.u.textContent = format(current.outputVoltage, 'V');
    reads.i.textContent = format(current.I, 'A');
    reads.r.textContent = Number.isFinite(current.R) ? format(current.R, 'Ω') : 'Circuito aberto';
    reads.p.textContent = format(current.P, 'W');
    reads.temp.textContent = `${current.temp.toFixed(1)} °C`;
    reads.meter.textContent = current.instrument.text;
    shell.querySelector('[data-source-label]').textContent = current.sourceMode;
    const sourceChip = shell.querySelector('[data-source-mode]'); sourceChip.textContent = `Fonte ${current.sourceMode}`; sourceChip.dataset.state = current.sourceMode === 'CC' ? 'attention' : 'success';
    const startState = shell.querySelector('[data-start-state]');
    startState.textContent = current.closed ? (current.faults.some((fault) => fault.severity === 'danger') ? 'Requer atenção' : 'Energizada') : 'Desenergizada';
    startState.dataset.state = current.closed ? (current.faults.some((fault) => fault.severity === 'danger') ? 'danger' : 'success') : 'measurement';
    const guidedTitle = shell.querySelector('[data-guided-title]');
    const guidedMessage = shell.querySelector('[data-guided-message]');
    const titles = { series: 'Corrente em circuito série', parallel: 'Tensão em circuito paralelo', mixed: 'Lei dos nós em circuito misto' };
    guidedTitle.textContent = titles[current.circuitTemplate];
    const danger = current.faults.find((fault) => fault.severity === 'danger');
    guidedMessage.textContent = danger ? danger.message : !current.closed ? 'Confira topologia e parâmetros; depois energize.' : `Circuito ativo: compare ${current.circuitTemplate === 'series' ? 'as correntes dos resistores' : current.circuitTemplate === 'parallel' ? 'as tensões dos ramos' : 'a corrente de entrada com a soma dos ramos'}.`;
    shell.querySelectorAll('[data-guided-step]').forEach((step) => step.classList.toggle('is-active', Number(step.dataset.guidedStep) === (!current.closed ? 2 : 3)));
    const templateLabels = { series: 'Série', parallel: 'Paralelo', mixed: 'Misto' };
    const templateChip = shell.querySelector('[data-template-state]'); templateChip.textContent = templateLabels[current.circuitTemplate]; templateChip.dataset.state = 'measurement';
    const fuseChip = shell.querySelector('[data-fuse-state]'); fuseChip.textContent = circuitFuseIntact && meterFuseIntact ? 'Fusíveis íntegros' : `${circuitFuseIntact ? '' : 'F1 aberto '}${meterFuseIntact ? '' : 'DMM aberto'}`.trim(); fuseChip.dataset.state = circuitFuseIntact && meterFuseIntact ? 'success' : 'danger';
    shell.querySelector('[data-meter-state]').textContent = current.instrument.state.toUpperCase();
    const meterBox = shell.querySelector('[data-meter-reading]'); meterBox.dataset.state = current.instrument.state; meterBox.querySelector('strong').textContent = current.instrument.text; meterBox.querySelector('small').textContent = current.instrument.message;
    const faults = current.faults; shell.querySelector('[data-fault-count]').textContent = `${faults.length} ${faults.length === 1 ? 'alerta' : 'alertas'}`; shell.querySelector('[data-fault-list]').innerHTML = faults.length ? faults.map((fault) => `<li data-state="${fault.severity}">${fault.message}</li>`).join('') : '<li data-state="success">Montagem segura e parâmetros dentro dos limites.</li>';
    const branchRows = current.network.branches.map((branch) => `<tr><th>${branch.id}</th><td>${branch.resistance.toFixed(1)} Ω</td><td>${branch.voltage.toFixed(2)} V</td><td>${(branch.current * 1000).toFixed(1)} mA</td><td>${branch.power.toFixed(3)} W</td></tr>`).join('');
    shell.querySelector('[data-branch-rows]').innerHTML = branchRows;
    shell.querySelector('[data-network-mode]').textContent = current.modelMode.toUpperCase();
    const activeCount = current.circuitTemplate === CIRCUIT_TEMPLATES.MIXED ? 3 : 2;
    shell.querySelector('[data-active-components]').textContent = `${activeCount} resistores`;
    shell.querySelector('[data-catalog-status]').textContent = `${activeCount} resistores ativos na bancada. Use o modo misto para liberar R3.`;
    shell.querySelector('[data-r3-control]').hidden = current.circuitTemplate !== CIRCUIT_TEMPLATES.MIXED;
    const branchFormula = current.circuitTemplate === CIRCUIT_TEMPLATES.SERIES
      ? `R<sub>eq</sub> = R1 + R2`
      : current.circuitTemplate === CIRCUIT_TEMPLATES.PARALLEL
        ? `1/R<sub>eq</sub> = 1/R1 + 1/R2`
        : `R<sub>eq</sub> = R1 + (R2·R3)/(R2+R3)`;
    shell.querySelector('[data-formula]').innerHTML = `${branchFormula}<br>R<sub>eq</sub> = <b>${Number.isFinite(current.R) ? current.R.toFixed(2) : '∞'} Ω</b><br>I<sub>total</sub> = <b>${format(current.I, 'A')}</b><br>Fonte: <b>${current.sourceMode}</b> · U<sub>saída</sub> = <b>${format(current.outputVoltage, 'V')}</b><br>P<sub>total</sub> = <b>${format(current.P, 'W')}</b><br>E = P·t = <b>${format(current.energy, 'J')}</b>`;
    shell.querySelector('[data-wiring-state]').textContent = wiringValid ? 'Circuito conectado' : 'Ligação incompleta'; shell.querySelector('[data-wiring-state]').dataset.state = wiringValid ? 'success' : 'danger';
    updatePracticeUi(current);
    drawChart(Number(inputs.u.value), Number.isFinite(current.R) ? current.R : 1e9, Number(inputs.limit.value));
  }
  function toggleCircuit() { closed = !closed; shell.querySelector('[data-switch] span:last-child').textContent = closed ? 'Desenergizar' : 'Energizar'; update(); }
  function resetExperiment() { inputs.u.value = 12; inputs.limit.value = .5; inputs.r1.value = 100; inputs.r2.value = 220; inputs.r3.value = 330; inputs.t.value = 1; inputs.fuse.value = .5; selects.template.value = CIRCUIT_TEMPLATES.SERIES; selects.model.value = MODEL_MODES.REALISTIC; selects.practice.value = 'series-current'; selects['meter-mode'].value = 'voltage-dc'; selects['meter-jack'].value = 'v-ohm'; selects.probe.value = 'load-parallel'; closed = false; circuitFuseIntact = true; meterFuseIntact = true; shell.querySelector('[data-switch] span:last-child').textContent = 'Energizar'; stageApi?.applyCircuitTemplate?.(selects.template.value); stageApi?.resetLayout?.(); update(); stageApi?.resetCamera(); }
  function selectComponent(id) { const [title, description] = componentInfo[id] || [id, 'Componente do experimento.']; const inspector = shell.querySelector('[data-inspector]'); inspector.querySelector('strong').textContent = title; inspector.querySelector('p').textContent = description; }
  function setFeedback(message, stateName = 'measurement') { const element = shell.querySelector('[data-feedback]'); element.textContent = message; element.dataset.state = stateName; }
  function updateModeUi(mode = 'select') { const labels = { select: 'Selecionar', move: 'Mover', rotate: 'Girar', connect: 'Conectar' }; shell.querySelectorAll('[data-mode]').forEach((button) => button.classList.toggle('is-active', button.dataset.mode === mode)); shell.querySelector('[data-mode-badge]').textContent = labels[mode]; shell.querySelector('[data-interaction-state]').textContent = `Modo ${labels[mode].toLowerCase()}`; shell.querySelector('[data-interaction-help]').textContent = mode === 'connect' ? 'Selecione dois terminais luminosos. Bornes de derivação aceitam mais de um cabo.' : mode === 'move' ? 'Arraste o equipamento ou use os eixos do gizmo.' : mode === 'rotate' ? 'Use o anel amarelo para girar em passos de 15°.' : 'Toque em um instrumento ou componente para inspecionar.'; }
  function updateHistoryUi(snapshot = {}) { const entries = snapshot.entries || []; shell.querySelector('[data-undo]').disabled = !snapshot.canUndo; shell.querySelector('[data-redo]').disabled = !snapshot.canRedo; shell.querySelector('[data-history-count]').textContent = `${entries.length} ${entries.length === 1 ? 'ação' : 'ações'}`; shell.querySelector('[data-history-list]').innerHTML = entries.length ? entries.slice().reverse().map((entry) => `<li>${entry}</li>`).join('') : '<li>Nenhuma alteração registrada.</li>'; }
  function updateWiring() { wiringValid = stageApi?.isCircuitComplete?.() ?? true; update(); }
  function saveLayout() { if (!stageApi) return; saveExperiment('ohm-layout-v2', { electrical: { ...rawConfig(), closed, circuitFuseIntact, meterFuseIntact }, layout: stageApi.serialize(), practice: selects.practice.value }); setFeedback('Montagem, rede resistiva e instrumentos salvos neste dispositivo.', 'success'); }
  function loadLayout() { const saved = loadExperiment('ohm-layout-v2'); if (!saved?.data) { setFeedback('Nenhuma montagem da versão atual foi encontrada.', 'attention'); return; } const { electrical = {}, layout, practice } = saved.data; inputs.u.value = electrical.sourceVoltage ?? 12; inputs.limit.value = electrical.currentLimit ?? .5; inputs.r1.value = electrical.resistorValues?.[0] ?? 100; inputs.r2.value = electrical.resistorValues?.[1] ?? 220; inputs.r3.value = electrical.resistorValues?.[2] ?? 330; inputs.t.value = electrical.duration ?? 1; inputs.fuse.value = electrical.circuitFuseRating ?? .5; selects.template.value = electrical.circuitTemplate ?? CIRCUIT_TEMPLATES.SERIES; selects.model.value = electrical.modelMode ?? MODEL_MODES.REALISTIC; selects.practice.value = practice ?? 'series-current'; selects['meter-mode'].value = electrical.meterMode ?? 'voltage-dc'; selects['meter-jack'].value = electrical.meterJack ?? 'v-ohm'; selects.probe.value = electrical.probePlacement ?? 'load-parallel'; closed = electrical.switchClosed === true || electrical.closed === true; circuitFuseIntact = electrical.circuitFuseIntact !== false; meterFuseIntact = electrical.meterFuseIntact !== false; shell.querySelector('[data-switch] span:last-child').textContent = closed ? 'Desenergizar' : 'Energizar'; stageApi?.applyCircuitTemplate?.(selects.template.value); stageApi?.restore(layout); updateWiring(); setFeedback('Montagem e rede resistiva recuperadas.', 'success'); }

  function applyTemplate(template, feedback = true) {
    selects.template.value = template;
    shell.querySelectorAll('[data-guided-template]').forEach((button) => button.classList.toggle('is-active', button.dataset.guidedTemplate === template));
    stageApi?.applyCircuitTemplate?.(template);
    stageApi?.configureMeter?.({ mode: selects['meter-mode'].value, jack: selects['meter-jack'].value, placement: selects.probe.value });
    wiringValid = stageApi?.isCircuitComplete?.() ?? true;
    if (feedback) setFeedback(`Topologia ${template === 'series' ? 'em série' : template === 'parallel' ? 'em paralelo' : 'mista'} aplicada com cabos 3D.`, 'success');
    update();
  }
  function applySafeStart() {
    const template = selects.template.value;
    closed = false;
    circuitFuseIntact = true; meterFuseIntact = true;
    selects.model.value = MODEL_MODES.REALISTIC;
    selects['meter-mode'].value = 'voltage-dc'; selects['meter-jack'].value = 'v-ohm'; selects.probe.value = 'load-parallel';
    inputs.limit.value = template === CIRCUIT_TEMPLATES.PARALLEL ? .8 : .5;
    inputs.fuse.value = template === CIRCUIT_TEMPLATES.PARALLEL ? 1 : .5;
    stageApi?.applyCircuitTemplate?.(template);
    stageApi?.configureMeter?.({ mode: selects['meter-mode'].value, jack: selects['meter-jack'].value, placement: selects.probe.value });
    stageApi?.resetCamera?.();
    wiringValid = stageApi?.isCircuitComplete?.() ?? true;
    shell.querySelector('[data-switch] span:last-child').textContent = 'Energizar';
    shell.querySelector('[data-start-feedback]').textContent = 'Montagem segura aplicada. Agora energize e compare as leituras.';
    setFeedback('Montagem guiada aplicada com proteção e medição de tensão em paralelo.', 'success');
    update();
  }

  function catalogAction(action) {
    if (action === 'add') applyTemplate(CIRCUIT_TEMPLATES.MIXED);
    if (action === 'duplicate') { inputs.r3.value = inputs.r2.value; applyTemplate(CIRCUIT_TEMPLATES.MIXED); setFeedback('R2 foi duplicado como R3 e inserido em um novo ramo paralelo.', 'success'); }
    if (action === 'remove') { applyTemplate(selects.template.value === CIRCUIT_TEMPLATES.MIXED ? CIRCUIT_TEMPLATES.PARALLEL : CIRCUIT_TEMPLATES.SERIES); setFeedback('R3 foi retirado e a bancada voltou a dois resistores ativos.', 'attention'); }
  }
  function checkPractice() {
    const { definition, checks } = updatePracticeUi(state());
    const passed = checks.every(Boolean);
    const feedback = shell.querySelector('[data-practice-feedback]');
    feedback.dataset.state = passed ? 'success' : 'attention';
    feedback.textContent = passed ? `Prática concluída: ${definition.title}. Relações científicas confirmadas.` : 'Ainda existem etapas pendentes. Confira a topologia, energização e os valores calculados.';
    shell.querySelector('[data-evidence-state]').textContent = passed ? 'Prática validada' : 'Registro parcial';
  }
  function downloadText(filename, content, type = 'application/json') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function exportEvidence() {
    const current = state();
    const practice = updatePracticeUi(current);
    const payload = {
      platform: 'Física Imersiva 360', version: '0.5.0', module: 'Laboratório Piloto de Eletricidade Premium',
      exportedAt: new Date().toISOString(),
      configuration: rawConfig(),
      network: summarizeNetwork(current.network),
      wiringValid, circuitFuseIntact, meterFuseIntact,
      instrument: current.instrument,
      faults: current.faults,
      practice: { id: selects.practice.value, title: practice.definition.title, checks: practice.checks, completed: practice.checks.every(Boolean) },
      layout: stageApi?.serialize?.() || null,
    };
    downloadText(`evidencia-eletricidade-${Date.now()}.json`, JSON.stringify(payload, null, 2));
    shell.querySelector('[data-evidence-state]').textContent = 'JSON exportado';
    setFeedback('Evidência científica exportada com parâmetros, medições e montagem.', 'success');
  }
  function exportCsv() {
    const current = state();
    const rows = [['Ramo', 'Resistencia_ohm', 'Tensao_V', 'Corrente_A', 'Potencia_W'], ...current.network.branches.map((branch) => [branch.id, branch.resistance, branch.voltage, branch.current, branch.power])];
    downloadText(`ramos-eletricos-${Date.now()}.csv`, rows.map((row) => row.join(';')).join('\n'), 'text/csv;charset=utf-8');
    shell.querySelector('[data-evidence-state]').textContent = 'CSV exportado';
  }

  Object.values(inputs).forEach((input) => input.addEventListener('input', update));
  Object.values(selects).forEach((select) => select.addEventListener('change', update));
  selects.template.addEventListener('change', () => applyTemplate(selects.template.value));
  selects.practice.addEventListener('change', () => { const definition = practiceDefinitions[selects.practice.value]; applyTemplate(definition.template, false); updatePracticeUi(); });
  shell.querySelectorAll('[data-guided-template]').forEach((button) => button.addEventListener('click', () => {
    shell.querySelectorAll('[data-guided-template]').forEach((item) => item.classList.toggle('is-active', item === button));
    applyTemplate(button.dataset.guidedTemplate);
    shell.querySelector('[data-start-feedback]').textContent = `Topologia ${button.querySelector('b').textContent.toLowerCase()} preparada. Ajuste a fonte ou aplique a montagem segura.`;
  }));
  shell.querySelectorAll('[data-safe-voltage]').forEach((button) => button.addEventListener('click', () => {
    inputs.u.value = button.dataset.safeVoltage;
    shell.querySelectorAll('[data-safe-voltage]').forEach((item) => item.classList.toggle('is-active', item === button));
    update();
  }));
  shell.querySelector('[data-safe-start]').addEventListener('click', applySafeStart);
  shell.querySelectorAll('[data-template]').forEach((button) => button.addEventListener('click', () => applyTemplate(button.dataset.template)));
  shell.querySelectorAll('[data-catalog-action]').forEach((button) => button.addEventListener('click', () => catalogAction(button.dataset.catalogAction)));
  shell.querySelector('[data-check-practice]').addEventListener('click', checkPractice);
  shell.querySelector('[data-export-evidence]').addEventListener('click', exportEvidence);
  shell.querySelector('[data-export-csv]').addEventListener('click', exportCsv);
  shell.querySelector('[data-switch]').addEventListener('click', toggleCircuit); shell.querySelector('[data-reset]').addEventListener('click', resetExperiment); shell.querySelector('[data-reset-camera]').addEventListener('click', () => stageApi?.resetCamera()); shell.querySelectorAll('[data-mode]').forEach((button) => button.addEventListener('click', () => stageApi?.setMode(button.dataset.mode))); shell.querySelector('[data-undo]').addEventListener('click', () => stageApi?.undo()); shell.querySelector('[data-redo]').addEventListener('click', () => stageApi?.redo()); shell.querySelector('[data-snap-toggle]').addEventListener('change', (event) => { stageApi?.setSnap(event.target.checked); setFeedback(event.target.checked ? 'Encaixe magnético ativado.' : 'Encaixe magnético desativado.'); });
  shell.querySelector('[data-reset-circuit-fuse]').addEventListener('click', () => { circuitFuseIntact = true; setFeedback('Fusível do circuito substituído.', 'success'); update(); }); shell.querySelector('[data-reset-meter-fuse]').addEventListener('click', () => { meterFuseIntact = true; setFeedback('Fusível interno do multímetro substituído.', 'success'); update(); });
  shell.querySelector('[data-wire-meter]').addEventListener('click', () => { stageApi?.configureMeter({ mode: selects['meter-mode'].value, jack: selects['meter-jack'].value, placement: selects.probe.value }); setFeedback('Pontas de prova reposicionadas em 3D.', 'success'); queueMicrotask(updateWiring); });
  shell.querySelector('[data-save-layout]').addEventListener('click', saveLayout); shell.querySelector('[data-load-layout]').addEventListener('click', loadLayout); shell.querySelectorAll('[data-focus]').forEach((button) => button.addEventListener('click', () => { stageApi?.focus(button.dataset.focus); selectComponent(button.dataset.focus); }));
  updateHistoryUi(); updateModeUi('select'); update();

  createBenchScene({ container: shell.querySelector('[data-bench-stage]'), statusElement: shell.querySelector('[data-render-status]'), getSettings, onSelect: selectComponent, history, onFeedback: setFeedback, onMode: updateModeUi, onWiringChange() { queueMicrotask(updateWiring); }, onReady(api) { stageApi = api; updateModeUi('select'); updateWiring(); }, getState: state })
    .then((cleanup) => { if (disposed) cleanup?.(); else cleanup3d = cleanup; }).catch((error) => { console.error(error); shell.querySelector('[data-render-status]').textContent = 'Fallback 2D · instrumentos 3D indisponíveis'; });

  return () => { disposed = true; cleanup3d?.(); };
}
