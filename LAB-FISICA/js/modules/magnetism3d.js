import { createRenderRuntime } from '../render/runtime.js';
import { createOrbitController } from '../render/orbit-controller.js';
import { getQualityProfile } from '../quality.js';
import {
  combinedDipoleField,
  electromagnetState,
  generatorState,
  motorState,
  transformerIdeal,
  magneticFlux,
  faradayEmf,
  magnitude,
  normalize,
} from '../science/electromagnetism.js';

function disposeGroup(group) {
  while (group.children.length) {
    const child = group.children.pop();
    child.traverse?.((object) => {
      object.geometry?.dispose?.();
      if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose?.());
      else object.material?.dispose?.();
    });
  }
}

function roundedBox(THREE, width, height, depth, radius = 0.08, segments = 4) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSegments: segments, steps: 1, bevelSize: radius * 0.28, bevelThickness: radius * 0.28 });
  geometry.center();
  return geometry;
}

function createLabArchitecture(THREE, scene, materials) {
  const world = new THREE.Group();
  const floor = new THREE.Mesh(new THREE.CylinderGeometry(8.8, 9.2, 0.34, 72), materials.coatedMetal(0x09151f, { roughness: 0.36 }));
  floor.position.y = -1.02;
  floor.receiveShadow = true;
  world.add(floor);

  const deck = new THREE.Mesh(new THREE.CylinderGeometry(5.7, 5.95, 0.18, 64), materials.metal(0x132638, { roughness: 0.26 }));
  deck.position.y = -0.78;
  deck.receiveShadow = true;
  world.add(deck);

  const ring = new THREE.Mesh(new THREE.TorusGeometry(5.85, 0.055, 10, 128), materials.emissive(0x9d7dff, { emissiveIntensity: 2.1 }));
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -0.67;
  world.add(ring);

  const wallMaterial = materials.metal(0x07111c, { roughness: 0.42 });
  for (let index = 0; index < 12; index += 1) {
    const angle = index / 12 * Math.PI * 2;
    const panel = new THREE.Mesh(roundedBox(2.4, 4.2, 0.2, 0.12), wallMaterial.clone());
    panel.position.set(Math.cos(angle) * 8, 1.05, Math.sin(angle) * 8);
    panel.rotation.y = -angle + Math.PI / 2;
    panel.receiveShadow = true;
    world.add(panel);
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.045, 3.45, 0.23), new THREE.MeshBasicMaterial({ color: index % 2 ? 0x9d7dff : 0x51dfff, transparent: true, opacity: 0.42 }));
    strip.position.set(Math.cos(angle) * 7.88, 1.15, Math.sin(angle) * 7.88);
    strip.rotation.y = -angle + Math.PI / 2;
    world.add(strip);
  }

  const ceiling = new THREE.Mesh(new THREE.TorusGeometry(7.9, 0.16, 12, 96), materials.metal(0x162737));
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 4.1;
  world.add(ceiling);

  const hologram = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 3.4, 0.08, 64), materials.glass(0x805dff, { opacity: 0.12, transmission: 0.4 }));
  hologram.position.y = -0.61;
  world.add(hologram);
  scene.add(world);
  return world;
}

function createBarMagnet(THREE, materials, { length = 2.7, height = 0.7, depth = 0.76 } = {}) {
  const group = new THREE.Group();
  const bodyGeometry = roundedBox(length / 2, height, depth, 0.16);
  const north = new THREE.Mesh(bodyGeometry, materials.coatedMetal(0xd83b4c, { clearcoat: 0.9, roughness: 0.18 }));
  north.position.x = length / 4;
  const south = new THREE.Mesh(bodyGeometry.clone(), materials.coatedMetal(0x226dcc, { clearcoat: 0.9, roughness: 0.18 }));
  south.position.x = -length / 4;
  [north, south].forEach((mesh) => { mesh.castShadow = true; mesh.receiveShadow = true; });
  const collar = new THREE.Mesh(new THREE.BoxGeometry(0.1, height * 1.06, depth * 1.06), materials.metal(0xc4d5df, { roughness: 0.18 }));
  const nMark = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.027, 8, 40), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  nMark.rotation.y = Math.PI / 2; nMark.position.set(length / 2 + 0.012, 0, 0);
  const sMark = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.17, 36), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }));
  sMark.rotation.y = Math.PI / 2; sMark.position.set(-length / 2 - 0.012, 0, 0);
  group.add(north, south, collar, nMark, sMark);
  return group;
}

function createCompass(THREE, materials, radius = 0.54) {
  const group = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 1.04, 0.12, 48), materials.metal(0x172c3b, { roughness: 0.26 }));
  base.receiveShadow = true;
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.9, radius * 0.9, 0.04, 48), materials.glass(0x8eeeff, { opacity: 0.12, transmission: 0.62 }));
  glass.position.y = 0.1;
  const dial = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.82, radius * 0.82, 0.026, 48), materials.ceramic(0xdbe5ea, { roughness: 0.72 }));
  dial.position.y = 0.08;
  const needle = new THREE.Group();
  const north = new THREE.Mesh(new THREE.ConeGeometry(0.09, radius * 0.72, 16), materials.emissive(0xef4459, { emissiveIntensity: 0.55 }));
  north.rotation.z = -Math.PI / 2; north.position.x = radius * 0.35;
  const south = new THREE.Mesh(new THREE.ConeGeometry(0.09, radius * 0.72, 16), materials.emissive(0x287bd8, { emissiveIntensity: 0.38 }));
  south.rotation.z = Math.PI / 2; south.position.x = -radius * 0.35;
  needle.position.y = 0.14;
  needle.add(north, south);
  group.add(base, dial, needle, glass);
  group.userData.needle = needle;
  return group;
}

function createArrow(THREE, color = 0x8ce9ff) {
  const group = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.7, 10), new THREE.MeshBasicMaterial({ color }));
  shaft.rotation.z = -Math.PI / 2; shaft.position.x = 0.35;
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.25, 14), new THREE.MeshBasicMaterial({ color }));
  cone.rotation.z = -Math.PI / 2; cone.position.x = 0.82;
  group.add(shaft, cone);
  return group;
}

function orientAlongXZ(object, field) {
  const angle = Math.atan2(field.z, field.x);
  object.rotation.y = -angle;
}

function makeFieldCurve(THREE, scale = 1, offset = 0, mirror = 1) {
  const points = [];
  for (let t = -Math.PI * 0.9; t <= Math.PI * 0.9; t += 0.035) {
    const denominator = Math.max(0.16, 1 + 0.54 * Math.cos(t));
    const radius = scale * (1.05 + offset) / denominator;
    points.push(new THREE.Vector3(Math.cos(t) * radius * mirror, Math.sin(t) * radius * 0.72, offset * 0.42));
  }
  return new THREE.CatmullRomCurve3(points);
}

function createFieldLineSet(THREE, count, color = 0xa48aff) {
  const group = new THREE.Group();
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.48, blending: THREE.AdditiveBlending });
  for (let index = 0; index < count; index += 1) {
    const layer = index % 2 ? 1 : -1;
    const curve = makeFieldCurve(THREE, 1.45 + (index % 5) * 0.32, (index - count / 2) * 0.035, layer);
    const points = curve.getPoints(120);
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material.clone());
    line.rotation.x = (index / count - 0.5) * 1.4;
    line.rotation.y = index * 0.42;
    group.add(line);
  }
  return group;
}

function createIronFilings(THREE, dipoles, detail) {
  const count = Math.max(90, Math.floor(detail / 12));
  const geometry = new THREE.BoxGeometry(0.13, 0.012, 0.025);
  const material = new THREE.MeshStandardMaterial({ color: 0x9ab0b8, metalness: 0.78, roughness: 0.38 });
  const mesh = new THREE.InstancedMesh(geometry, material, count);
  const dummy = new THREE.Object3D();
  const samples = [];
  for (let index = 0; index < count; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 1.3 + Math.random() * 3.6;
    const point = { x: Math.cos(angle) * radius, y: -0.48 + Math.random() * 0.08, z: Math.sin(angle) * radius * 0.7 };
    const field = combinedDipoleField(point, dipoles);
    dummy.position.set(point.x, point.y, point.z);
    dummy.rotation.set(0, -Math.atan2(field.z, field.x), (Math.random() - 0.5) * 0.08);
    dummy.scale.setScalar(0.72 + Math.random() * 0.65);
    dummy.updateMatrix();
    mesh.setMatrixAt(index, dummy.matrix);
    samples.push({ point, field });
  }
  mesh.instanceMatrix.needsUpdate = true;
  mesh.userData.samples = samples;
  mesh.userData.updateField = (activeDipoles) => {
    samples.forEach(({ point }, index) => {
      const field = combinedDipoleField(point, activeDipoles);
      dummy.position.set(point.x, point.y, point.z);
      dummy.rotation.set(0, -Math.atan2(field.z, field.x), 0);
      dummy.scale.setScalar(0.88);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  };
  return mesh;
}

function createHelix(THREE, { turns = 28, radius = 1.05, length = 3.3, thickness = 0.045, color = 0xd98437 } = {}) {
  const points = [];
  const segments = Math.max(180, turns * 14);
  for (let index = 0; index <= segments; index += 1) {
    const t = index / segments;
    const angle = t * turns * Math.PI * 2;
    points.push(new THREE.Vector3((t - 0.5) * length, Math.cos(angle) * radius, Math.sin(angle) * radius));
  }
  const curve = new THREE.CatmullRomCurve3(points);
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, segments, thickness, 8, false), new THREE.MeshPhysicalMaterial({ color, metalness: 0.78, roughness: 0.24, clearcoat: 0.45 }));
  mesh.userData.curve = curve;
  mesh.castShadow = true;
  return mesh;
}

function createMovingDots(THREE, curve, count, color) {
  const geometry = new THREE.SphereGeometry(0.065, 10, 8);
  const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.88 });
  const dots = [];
  for (let index = 0; index < count; index += 1) {
    const dot = new THREE.Mesh(geometry, material.clone());
    dot.userData.offset = index / count;
    dots.push(dot);
  }
  return { dots, update(time, speed = 1) { dots.forEach((dot) => { const raw = time * speed * 0.08 + dot.userData.offset; const t = ((raw % 1) + 1) % 1; dot.position.copy(curve.getPointAt(t)); }); } };
}

function createWaveformPanel(THREE, materials) {
  const group = new THREE.Group();
  const caseMesh = new THREE.Mesh(roundedBox(2.5, 1.45, 0.22, 0.12), materials.polymer(0x101c25));
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 1.02), materials.emissive(0x163841, { emissive: 0x29f5b0, emissiveIntensity: 0.42, color: 0x071719 }));
  screen.position.z = 0.13;
  group.add(caseMesh, screen);
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x58ffbf, transparent: true, opacity: 0.9 });
  const points = [];
  for (let index = 0; index <= 80; index += 1) points.push(new THREE.Vector3(-0.98 + index / 80 * 1.96, 0, 0.145));
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), lineMaterial);
  group.add(line);
  group.userData.waveLine = line;
  return group;
}

function updateWaveform(panel, amplitude, phase = 0, harmonic = 1) {
  const attribute = panel.userData.waveLine.geometry.attributes.position;
  for (let index = 0; index < attribute.count; index += 1) {
    const x = -0.98 + index / (attribute.count - 1) * 1.96;
    attribute.setXYZ(index, x, Math.sin(index / (attribute.count - 1) * Math.PI * 2 * harmonic + phase) * amplitude, 0.145);
  }
  attribute.needsUpdate = true;
}

function createMagnetMode(THREE, root, materials, state, detail) {
  const magnetA = createBarMagnet(THREE, materials);
  magnetA.position.set(-1.45, 0.22, 0);
  const magnetB = createBarMagnet(THREE, materials);
  magnetB.position.set(1.45, 0.22, 0);
  magnetB.rotation.y = Math.PI;
  root.add(magnetA, magnetB);

  const dipoles = [
    { dipolePosition: { x: -1.45, y: 0.22, z: 0 }, moment: { x: 1.7, y: 0, z: 0 } },
    { dipolePosition: { x: 1.45, y: 0.22, z: 0 }, moment: { x: -1.7, y: 0, z: 0 } },
  ];
  const fieldLines = createFieldLineSet(THREE, detail > 1000 ? 20 : 12);
  fieldLines.scale.setScalar(1.22);
  root.add(fieldLines);
  const filings = createIronFilings(THREE, dipoles, detail);
  root.add(filings);

  const compasses = [];
  for (let index = 0; index < 8; index += 1) {
    const angle = index / 8 * Math.PI * 2;
    const compass = createCompass(THREE, materials, 0.32);
    compass.position.set(Math.cos(angle) * 3.65, -0.45, Math.sin(angle) * 2.45);
    const field = combinedDipoleField(compass.position, dipoles);
    orientAlongXZ(compass.userData.needle, field);
    root.add(compass);
    compasses.push(compass);
  }
  const probe = createArrow(THREE, 0x7eeaff);
  probe.position.set(0, 1.25, 2.1);
  root.add(probe);

  return ({ time, delta, params }) => {
    const separation = params.separation;
    magnetA.position.x = -separation / 2;
    magnetB.position.x = separation / 2;
    dipoles[0].dipolePosition.x = -separation / 2;
    dipoles[1].dipolePosition.x = separation / 2;
    dipoles[1].moment.x = params.polarity === 'attract' ? -1.7 : 1.7;
    magnetB.rotation.y = params.polarity === 'attract' ? Math.PI : 0;
    fieldLines.visible = params.lines;
    filings.visible = params.filings;
    filings.userData.updateField?.(dipoles);
    fieldLines.children.forEach((line, index) => {
      const repelling = params.polarity === 'repel';
      line.position.x = repelling ? (index % 2 ? separation / 2 : -separation / 2) : 0;
      line.scale.setScalar(repelling ? 0.62 : 1);
      line.material.color.setHex(repelling ? (index % 2 ? 0x4f8fff : 0xff5f7b) : 0xa48aff);
    });
    compasses.forEach((compass) => {
      const field = combinedDipoleField(compass.position, dipoles);
      orientAlongXZ(compass.userData.needle, field);
    });
    probe.position.set(params.probeX, 1.25, params.probeZ);
    const probeField = combinedDipoleField(probe.position, dipoles);
    orientAlongXZ(probe, probeField);
    probe.scale.setScalar(0.55 + Math.min(1.4, magnitude(probeField) * 2e6));
    state.field = magnitude(probeField);
    state.fieldVector = probeField;
    fieldLines.children.forEach((line, index) => { line.material.opacity = 0.22 + 0.28 * (0.5 + 0.5 * Math.sin(time * 1.4 + index)); });
    magnetA.rotation.x = Math.sin(time * 0.7) * 0.012;
    magnetB.rotation.x = -Math.sin(time * 0.7) * 0.012;
  };
}

function createSolenoidMode(THREE, root, materials, state) {
  const base = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.3, 3.8), materials.coatedMetal(0x132536, { roughness: 0.32 }));
  base.position.y = -0.55; base.receiveShadow = true; root.add(base);
  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 3.9, 48), materials.metal(0x798690, { roughness: 0.24 }));
  core.rotation.z = Math.PI / 2; core.castShadow = true; root.add(core);
  const coil = createHelix(THREE, { turns: 34, radius: 0.96, length: 4.1, thickness: 0.055 });
  root.add(coil);
  const currentDots = createMovingDots(THREE, coil.userData.curve, 22, 0xffc56a);
  currentDots.dots.forEach((dot) => root.add(dot));
  const fieldLines = new THREE.Group();
  for (let index = 0; index < 10; index += 1) {
    const radius = 0.46 + index * 0.18;
    const curve = new THREE.EllipseCurve(0, 0, 2.75, radius, 0, Math.PI * 2, false, 0);
    const points = curve.getPoints(100).map((point) => new THREE.Vector3(point.x, point.y, (index - 4.5) * 0.13));
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: 0x9b7cff, transparent: true, opacity: 0.34 }));
    fieldLines.add(line);
  }
  fieldLines.rotation.x = Math.PI / 2;
  root.add(fieldLines);
  const compass = createCompass(THREE, materials, 0.48); compass.position.set(3.2, -0.35, 0); root.add(compass);
  const probeArrow = createArrow(THREE, 0xd4c3ff); probeArrow.position.set(2.8, 0.85, 0); root.add(probeArrow);
  return ({ time, params }) => {
    const model = electromagnetState({ current: params.current, turns: params.turns, length: params.solenoidLength, relativePermeability: params.coreMu, resistance: 3.4 });
    state.solenoid = model;
    currentDots.dots.forEach((dot) => { dot.visible = params.particles && Math.abs(params.current) > 0.02; });
    currentDots.update(time, params.current * 0.75);
    fieldLines.visible = params.lines;
    fieldLines.scale.y = 0.55 + Math.min(1.5, Math.abs(model.field) * 900);
    fieldLines.children.forEach((line, index) => { line.material.opacity = 0.12 + Math.min(0.56, Math.abs(model.field) * 120 + index * 0.008); });
    core.material.color.setHex(params.coreMu > 5 ? 0x69747d : 0x29343e);
    core.material.emissive?.setHex?.(model.temperature > 70 ? 0x7a1e0d : 0x000000);
    core.material.emissiveIntensity = Math.max(0, (model.temperature - 55) / 80);
    compass.userData.needle.rotation.y = params.current >= 0 ? 0 : Math.PI;
    probeArrow.rotation.y = params.current >= 0 ? 0 : Math.PI;
    probeArrow.scale.setScalar(0.75 + Math.min(1.4, Math.abs(model.field) * 800));
  };
}

function createInductionMode(THREE, root, materials, state) {
  const coil = createHelix(THREE, { turns: 22, radius: 1.35, length: 1.6, thickness: 0.06, color: 0xd47b32 });
  coil.rotation.y = Math.PI / 2;
  root.add(coil);
  const magnet = createBarMagnet(THREE, materials, { length: 2.35, height: 0.65, depth: 0.68 });
  magnet.rotation.y = Math.PI / 2;
  root.add(magnet);
  const currentDots = createMovingDots(THREE, coil.userData.curve, 18, 0x67f4ff);
  currentDots.dots.forEach((dot) => root.add(dot));
  const panel = createWaveformPanel(THREE, materials); panel.position.set(0, 1.8, -2.7); root.add(panel);
  const fluxDisk = new THREE.Mesh(new THREE.CircleGeometry(1.18, 64), materials.glass(0x8f75ff, { opacity: 0.16, transmission: 0.3 }));
  fluxDisk.rotation.y = Math.PI / 2; root.add(fluxDisk);
  let previousFlux = 0;
  return ({ time, delta, params }) => {
    const frequency = params.speed * 0.24;
    const x = Math.sin(time * frequency * Math.PI * 2) * 2.65;
    const velocity = Math.cos(time * frequency * Math.PI * 2) * 2.65 * frequency * Math.PI * 2;
    magnet.position.x = x;
    const effectiveField = params.magnetStrength * 0.22 / (0.35 + x * x);
    const flux = magneticFlux({ field: effectiveField, area: Math.PI * 1.18 ** 2, angle: 0 });
    const emf = faradayEmf({ turns: params.turns, fluxInitial: previousFlux, fluxFinal: flux, deltaTime: Math.max(delta, 1 / 120) });
    previousFlux = flux;
    state.induction = { x, velocity, flux, emf };
    currentDots.dots.forEach((dot) => { dot.visible = params.particles && Math.abs(emf) > 0.02; dot.material.color.setHex(emf >= 0 ? 0x59eeff : 0xff75ca); });
    currentDots.dots.forEach((dot) => { const raw = time * Math.max(0.4, Math.abs(emf) * 0.18) * Math.sign(emf || 1) * 0.08 + dot.userData.offset; const t = ((raw % 1) + 1) % 1; const point = coil.userData.curve.getPointAt(t).applyEuler(coil.rotation); dot.position.copy(point); });
    fluxDisk.material.opacity = 0.08 + Math.min(0.42, Math.abs(flux) * 4);
    fluxDisk.material.color.setHex(emf >= 0 ? 0x55dfff : 0xff6fca);
    updateWaveform(panel, Math.min(0.42, Math.abs(emf) * 0.01 + 0.05), time * frequency * Math.PI * 2, 1);
  };
}

function createMotorMode(THREE, root, materials, state, generator = false) {
  const frame = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.35, 4.2), materials.coatedMetal(0x152a39)); base.position.y = -0.62; frame.add(base);
  const north = new THREE.Mesh(roundedBox(1.15, 2.8, 1.25, 0.18), materials.coatedMetal(0xd73b4c)); north.position.set(-2.05, 0.65, 0);
  const south = new THREE.Mesh(roundedBox(1.15, 2.8, 1.25, 0.18), materials.coatedMetal(0x236bc7)); south.position.set(2.05, 0.65, 0);
  frame.add(north, south);
  const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 4.8, 24), materials.metal(0xb9c8d0)); axle.rotation.z = Math.PI / 2; axle.castShadow = true; frame.add(axle);
  const rotor = new THREE.Group();
  const coilMaterial = new THREE.MeshPhysicalMaterial({ color: 0xd98236, metalness: 0.8, roughness: 0.22, clearcoat: 0.4 });
  const coilCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.1, 0.9, 0), new THREE.Vector3(1.1, 0.9, 0), new THREE.Vector3(1.1, -0.9, 0), new THREE.Vector3(-1.1, -0.9, 0), new THREE.Vector3(-1.1, 0.9, 0),
  ], true);
  const coil = new THREE.Mesh(new THREE.TubeGeometry(coilCurve, 110, 0.075, 10, true), coilMaterial); rotor.add(coil);
  const commutator = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.5, 32), materials.coatedMetal(0xbf6f31)); commutator.rotation.z = Math.PI / 2; commutator.position.x = 1.55; rotor.add(commutator);
  frame.add(rotor);
  const fan = new THREE.Group(); fan.position.x = -2.75;
  for (let index = 0; index < 5; index += 1) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.78, 0.3), materials.polymer(0x5fd8ea, { transparent: true, opacity: 0.72 }));
    blade.position.y = 0.42; blade.rotation.x = index * Math.PI * 2 / 5; fan.add(blade);
  }
  fan.rotation.z = Math.PI / 2; frame.add(fan);
  const fieldArrows = new THREE.Group();
  for (let y = -1; y <= 1; y += 0.5) {
    const arrow = createArrow(THREE, 0x9a82ff); arrow.scale.setScalar(0.52); arrow.position.set(-0.8, y + 0.65, -1.25); fieldArrows.add(arrow);
  }
  frame.add(fieldArrows);
  const panel = createWaveformPanel(THREE, materials); panel.position.set(0, 2.7, -2.3); frame.add(panel);
  root.add(frame);
  return ({ time, delta, params }) => {
    if (generator) {
      const model = generatorState({ turns: params.turns, field: params.magnetStrength, area: 0.012, rpm: params.rpm, time, loadResistance: params.loadResistance, efficiency: 0.86 });
      state.generator = model;
      rotor.rotation.x += delta * model.angularSpeed;
      fan.rotation.x += delta * model.angularSpeed;
      updateWaveform(panel, Math.min(0.42, model.rmsVoltage / 280), time * model.angularSpeed, 1);
      coilMaterial.emissive.setHex(model.instantaneousVoltage >= 0 ? 0x263d56 : 0x4c163c);
      coilMaterial.emissiveIntensity = Math.min(1.2, Math.abs(model.instantaneousVoltage) / 180);
    } else {
      const angularSpeed = Math.max(0, params.speed * 14);
      const model = motorState({ turns: params.turns, current: params.current, area: 0.008, field: params.magnetStrength, angle: Math.PI / 2, angularSpeed, resistance: 3.2 });
      state.motor = model;
      rotor.rotation.x += delta * angularSpeed * Math.sign(params.current || 1);
      fan.rotation.x += delta * angularSpeed * Math.sign(params.current || 1);
      updateWaveform(panel, Math.min(0.4, Math.abs(model.torque) * 0.02), time * 2, 2);
      coilMaterial.emissive.setHex(model.copperLoss > 18 ? 0x7d1d0e : 0x2d1908);
      coilMaterial.emissiveIntensity = Math.min(1.4, model.copperLoss / 30);
    }
    fieldArrows.visible = params.lines;
  };
}

function createTransformerMode(THREE, root, materials, state) {
  const base = new THREE.Mesh(new THREE.BoxGeometry(6, 0.3, 4), materials.coatedMetal(0x142838)); base.position.y = -0.65; root.add(base);
  const coreMaterial = materials.metal(0x66737d, { roughness: 0.28 });
  const core = new THREE.Group();
  const top = new THREE.Mesh(new THREE.BoxGeometry(4.7, 0.65, 1.15), coreMaterial); top.position.y = 1.7;
  const bottom = top.clone(); bottom.position.y = -0.25;
  const left = new THREE.Mesh(new THREE.BoxGeometry(0.75, 2.6, 1.15), coreMaterial); left.position.set(-1.95, 0.72, 0);
  const right = left.clone(); right.position.x = 1.95;
  core.add(top, bottom, left, right); root.add(core);
  const primary = createHelix(THREE, { turns: 22, radius: 0.72, length: 1.45, thickness: 0.045, color: 0xd77b32 }); primary.rotation.z = Math.PI / 2; primary.position.set(-1.95, 0.72, 0); root.add(primary);
  const secondary = createHelix(THREE, { turns: 34, radius: 0.72, length: 1.45, thickness: 0.045, color: 0x58bce7 }); secondary.rotation.z = Math.PI / 2; secondary.position.set(1.95, 0.72, 0); root.add(secondary);
  const primaryDots = createMovingDots(THREE, primary.userData.curve, 14, 0xffc15c); primaryDots.dots.forEach((dot) => { dot.position.add(primary.position); root.add(dot); });
  const secondaryDots = createMovingDots(THREE, secondary.userData.curve, 18, 0x62ddff); secondaryDots.dots.forEach((dot) => { dot.position.add(secondary.position); root.add(dot); });
  const flux = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.035, 10, 96), new THREE.MeshBasicMaterial({ color: 0xa47fff, transparent: true, opacity: 0.48 })); flux.scale.x = 1.65; flux.position.y = 0.72; root.add(flux);
  const panel = createWaveformPanel(THREE, materials); panel.position.set(0, 3, -2.25); root.add(panel);
  return ({ time, params }) => {
    const model = transformerIdeal({ primaryTurns: params.primaryTurns, secondaryTurns: params.secondaryTurns, primaryVoltage: params.primaryVoltage, primaryCurrent: params.current, efficiency: params.efficiency });
    state.transformer = model;
    primaryDots.dots.forEach((dot) => { const p = primary.userData.curve.getPointAt((time * 0.11 + dot.userData.offset) % 1).applyEuler(primary.rotation); dot.position.copy(p).add(primary.position); dot.visible = params.particles; });
    secondaryDots.dots.forEach((dot) => { const p = secondary.userData.curve.getPointAt((time * 0.11 / Math.max(0.2, model.ratio) + dot.userData.offset) % 1).applyEuler(secondary.rotation); dot.position.copy(p).add(secondary.position); dot.visible = params.particles; });
    flux.visible = params.lines;
    flux.material.opacity = 0.16 + Math.min(0.62, Math.abs(model.inputPower) / 250);
    flux.scale.y = 0.9 + 0.12 * Math.sin(time * 2 * Math.PI * 2);
    coreMaterial.emissive = new THREE.Color(model.losses > 18 ? 0x661809 : 0x101010);
    coreMaterial.emissiveIntensity = Math.min(1, model.losses / 45);
    updateWaveform(panel, Math.min(0.38, Math.abs(model.secondaryVoltage) / 380), time * 2 * Math.PI, 1);
  };
}

const BUILDERS = {
  magnets: createMagnetMode,
  solenoid: createSolenoidMode,
  induction: createInductionMode,
  motor: (THREE, root, materials, state) => createMotorMode(THREE, root, materials, state, false),
  generator: (THREE, root, materials, state) => createMotorMode(THREE, root, materials, state, true),
  transformer: createTransformerMode,
};

export async function mountMagnetism3D({ container, statusElement, getSettings, getParams, onState, onModeChange }) {
  const runtime = await createRenderRuntime({
    container,
    statusElement,
    getSettings,
    canvasClass: 'magnetism-webgl',
    fallbackClass: 'magnetism-stage--fallback',
    camera: { fov: 48, near: 0.08, far: 120 },
    scene: { background: 0x01050b, fogColor: 0x02060d, fogDensity: 0.022, exposure: 1.18 },
    environment: { upper: '#08061d', horizon: '#33215d', lower: '#010307', accent: '#a884ff' },
  });
  if (!runtime) return { setMode() {}, resetCamera() {}, setAutoCamera() {}, setPlaying() {}, restart() {}, fullscreen() { container.classList.toggle('is-immersive'); }, dispose() {} };
  const { THREE, scene, camera, renderer, materials } = runtime;
  scene.add(new THREE.HemisphereLight(0x9adfff, 0x0c0618, 1.25));
  const key = new THREE.DirectionalLight(0xe8f4ff, 2.8); key.position.set(5, 8, 6); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); scene.add(key);
  const violet = new THREE.PointLight(0x8d6bff, 32, 18, 2); violet.position.set(-4, 2, -2); scene.add(violet);
  const cyan = new THREE.PointLight(0x55dfff, 24, 18, 2); cyan.position.set(4, 1.2, 3); scene.add(cyan);
  createLabArchitecture(THREE, scene, materials);
  const experimentRoot = new THREE.Group(); experimentRoot.position.y = 0.05; scene.add(experimentRoot);
  const state = {};
  let currentMode = 'magnets';
  let updateExperiment = () => {};
  let autoCamera = !getSettings().reduceMotion;
  let playing = true;
  let elapsed = 0;

  function rebuild(mode) {
    currentMode = BUILDERS[mode] ? mode : 'magnets';
    disposeGroup(experimentRoot);
    updateExperiment = BUILDERS[currentMode](THREE, experimentRoot, materials, state, getQualityProfile().particles);
    onModeChange?.(currentMode);
  }
  rebuild(currentMode);

  const controller = createOrbitController({
    element: renderer.domElement,
    camera,
    target: { x: 0, y: 0.55, z: 0 },
    yaw: 0.76,
    pitch: 0.2,
    radius: 10.8,
    minRadius: 4.3,
    maxRadius: 18,
    minPitch: -0.36,
    maxPitch: 0.76,
    heightFactor: 0.7,
  });
  runtime.bindCameraController(controller);

  runtime.start(({ delta }) => {
    if (playing) elapsed += delta;
    const params = getParams();
    updateExperiment({ time: elapsed, delta: playing ? delta : 0, params });
    if (autoCamera && !controller.isInteracting && !getSettings().reduceMotion) controller.rotate(delta * 0.045, 0);
    controller.update();
    onState?.({ ...state, mode: currentMode });
  });

  return {
    setMode: rebuild,
    resetCamera: () => controller.reset(),
    setAutoCamera(value) { autoCamera = Boolean(value); },
    setPlaying(value) { playing = Boolean(value); },
    restart() { elapsed = 0; rebuild(currentMode); },
    async fullscreen() {
      try { await container.requestFullscreen?.(); } catch { container.classList.toggle('is-immersive'); }
    },
    dispose() { controller.dispose(); runtime.dispose(); },
  };
}
