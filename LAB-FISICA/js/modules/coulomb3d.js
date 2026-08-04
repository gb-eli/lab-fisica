import { createRenderRuntime } from '../render/runtime.js';
import { createOrbitController } from '../render/orbit-controller.js';
import { electricFieldAt, electricPotentialAt, normalizedToMeters } from '../science/electrostatics.js';

const ARENA_METERS = 3;
const WORLD_X = 7.2;
const WORLD_Z = 4.6;

function roundedRectPath(context, x, y, width, height, radius) {
  context.beginPath();
  if (typeof context.roundRect === 'function') context.roundRect(x, y, width, height, radius);
  else context.rect(x, y, width, height);
}

function toWorld(point, y = 0.62) {
  return { x: (point.x - 0.5) * WORLD_X, y, z: (point.y - 0.5) * WORLD_Z };
}

function toNormalized(point) {
  return {
    x: Math.max(0.06, Math.min(0.94, point.x / WORLD_X + 0.5)),
    y: Math.max(0.17, Math.min(0.83, point.z / WORLD_Z + 0.5)),
  };
}

function makeLabel(THREE, text, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 96;
  const context = canvas.getContext('2d');
  context.fillStyle = 'rgba(2,8,15,.82)';
  context.strokeStyle = color;
  context.lineWidth = 5;
  roundedRectPath(context, 5, 5, 246, 86, 20); context.fill(); context.stroke();
  context.fillStyle = '#eefaff'; context.font = '800 44px system-ui'; context.textAlign = 'center'; context.textBaseline = 'middle';
  context.fillText(text, 128, 49);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
  sprite.scale.set(1.25, .47, 1);
  sprite.userData.disposeTexture = texture;
  return sprite;
}

function makeCharge(THREE, label) {
  const group = new THREE.Group();
  const shell = new THREE.Mesh(
    new THREE.SphereGeometry(.43, 40, 28),
    new THREE.MeshPhysicalMaterial({ color: 0xff6b79, metalness: .1, roughness: .22, clearcoat: 1, clearcoatRoughness: .12, emissive: 0x541018, emissiveIntensity: .6 }),
  );
  shell.castShadow = true; shell.receiveShadow = true;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.5, .025, 10, 64), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .72 }));
  ring.rotation.x = Math.PI / 2;
  const marker = makeLabel(THREE, label, '#9cecff'); marker.position.y = .82;
  const light = new THREE.PointLight(0xff6b79, 4, 4, 2); light.position.y = .15;
  group.add(shell, ring, marker, light);
  group.userData = { shell, ring, marker, light };
  return group;
}

function setChargeAppearance(THREE, group, value) {
  const signature = Number(value).toPrecision(8);
  if (group.userData.lastAppearance === signature) return;
  group.userData.lastAppearance = signature;
  const positive = value > 0; const neutral = Math.abs(value) < 1e-12;
  const color = neutral ? 0x91a4b5 : positive ? 0xff6377 : 0x579cff;
  group.userData.shell.material.color.setHex(color);
  group.userData.shell.material.emissive.setHex(neutral ? 0x18222b : positive ? 0x5a101c : 0x0b2858);
  group.userData.light.color.setHex(color);
  group.userData.light.intensity = neutral ? .5 : 3.2 + Math.min(4, Math.abs(value) * 1e6 * .75);
  const symbol = neutral ? '0' : positive ? '+' : '−';
  const canvas = group.userData.marker.material.map.image;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(2,8,15,.84)'; ctx.strokeStyle = `#${new THREE.Color(color).getHexString()}`; ctx.lineWidth = 5;
  roundedRectPath(ctx, 5, 5, 246, 86, 20); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#eefaff'; ctx.font = '900 52px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(symbol, 128, 49);
  group.userData.marker.material.map.needsUpdate = true;
}

function updateArrow(arrow, origin, vector, scale = 1) {
  const magnitude = Math.hypot(vector.x, vector.y);
  arrow.position.set(origin.x, origin.y, origin.z);
  if (!magnitude) { arrow.visible = false; return; }
  arrow.visible = true;
  arrow.setDirection(new arrow.userData.THREE.Vector3(vector.x / magnitude, 0, vector.y / magnitude));
  arrow.setLength(Math.max(.4, Math.min(2.1, .55 + Math.log10(magnitude + 1) * .22)) * scale, .28, .16);
}

export async function mountCoulomb3D({ container, statusElement, getSettings, getState, onPositionChange }) {
  const runtime = await createRenderRuntime({
    container, statusElement, getSettings, canvasClass: 'coulomb-webgl',
    camera: { fov: 46, near: .05, far: 80 },
    scene: { background: 0x020711, fogDensity: .018, fogColor: 0x020711, exposure: 1.18 },
    environment: { accent: '#4ddcff', upper: '#123b58', lower: '#020711', background: false },
  });
  if (!runtime) return null;
  const { THREE, scene, camera, renderer, materials } = runtime;
  const hemi = new THREE.HemisphereLight(0x9deaff, 0x071018, 1.55); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xe8f8ff, 4.2); key.position.set(3, 7, 4); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); scene.add(key);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 7), materials.coatedMetal(0x071521, { roughness: .55, metalness: .45 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const grid = new THREE.GridHelper(9, 18, 0x2ba7d3, 0x17415b); grid.position.y = .012; grid.scale.z = .68; scene.add(grid);
  const platform = new THREE.Mesh(new THREE.BoxGeometry(8.6, .22, 5.6), materials.coatedMetal(0x0b2232, { roughness: .36 }));
  platform.position.y = -.13; platform.receiveShadow = true; scene.add(platform);
  const boundary = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(8.62, .24, 5.62)), new THREE.LineBasicMaterial({ color: 0x52d9ff, transparent: true, opacity: .38 })); boundary.position.y = -.13; scene.add(boundary);

  const chargeA = makeCharge(THREE, '+'); chargeA.userData.kind = 'a';
  const chargeB = makeCharge(THREE, '−'); chargeB.userData.kind = 'b';
  const probe = new THREE.Group(); probe.userData.kind = 'probe';
  const probeRing = new THREE.Mesh(new THREE.TorusGeometry(.25, .035, 12, 48), new THREE.MeshPhysicalMaterial({ color: 0x55e39f, emissive: 0x174c35, emissiveIntensity: 1.3, metalness: .35, roughness: .22 })); probeRing.rotation.x = Math.PI / 2;
  const probeCore = new THREE.Mesh(new THREE.SphereGeometry(.09, 20, 14), new THREE.MeshBasicMaterial({ color: 0xd9ffec }));
  const probeLabel = makeLabel(THREE, 'SONDA', '#55e39f'); probeLabel.position.y = .58; probeLabel.scale.set(1.05, .39, 1);
  probe.add(probeRing, probeCore, probeLabel); scene.add(chargeA, chargeB, probe);

  const forceA = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 1, 0xffd774, .28, .16); forceA.userData.THREE = THREE;
  const forceB = new THREE.ArrowHelper(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(), 1, 0xffd774, .28, .16); forceB.userData.THREE = THREE;
  scene.add(forceA, forceB);

  const fieldArrows = [];
  for (let iz = 0; iz < 5; iz += 1) {
    for (let ix = 0; ix < 7; ix += 1) {
      const arrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), .45, 0x69dfff, .14, .08);
      arrow.userData.THREE = THREE; fieldArrows.push({ arrow, nx: .14 + ix * .12, ny: .22 + iz * .14 }); scene.add(arrow);
    }
  }

  const heatCanvas = document.createElement('canvas'); heatCanvas.width = 320; heatCanvas.height = 200;
  const heatTexture = new THREE.CanvasTexture(heatCanvas); heatTexture.colorSpace = THREE.SRGBColorSpace;
  const heatPlane = new THREE.Mesh(new THREE.PlaneGeometry(8.15, 5.15), new THREE.MeshBasicMaterial({ map: heatTexture, transparent: true, opacity: .42, depthWrite: false }));
  heatPlane.rotation.x = -Math.PI / 2; heatPlane.position.y = .035; scene.add(heatPlane);

  const controller = createOrbitController({ element: renderer.domElement, camera, target: { x: 0, y: .25, z: 0 }, yaw: .62, pitch: .52, radius: 8.2, minRadius: 4.8, maxRadius: 12.5, minPitch: .18, maxPitch: 1.12, heightFactor: .8 });
  runtime.bindCameraController(controller);

  const raycaster = new THREE.Raycaster(); const pointer = new THREE.Vector2();
  const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -.62);
  let dragging = null; const dragPoint = new THREE.Vector3(); let signature = '';
  function locate(event) { const rect = renderer.domElement.getBoundingClientRect(); pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1; pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1; raycaster.setFromCamera(pointer, camera); }
  function onPointerDown(event) {
    locate(event); const hits = raycaster.intersectObjects([chargeA, chargeB, probe], true);
    const root = hits[0]?.object;
    if (!root) return;
    let target = root; while (target && !target.userData.kind) target = target.parent;
    if (!target?.userData.kind) return;
    dragging = target; controller.setEnabled(false); renderer.domElement.setPointerCapture?.(event.pointerId); event.stopPropagation();
  }
  function onPointerMove(event) {
    if (!dragging) return; locate(event); if (!raycaster.ray.intersectPlane(dragPlane, dragPoint)) return;
    dragPoint.x = Math.max(-3.2, Math.min(3.2, dragPoint.x)); dragPoint.z = Math.max(-1.65, Math.min(1.65, dragPoint.z));
    const normalized = toNormalized(dragPoint); onPositionChange?.(dragging.userData.kind, normalized);
  }
  function onPointerUp(event) { if (!dragging) return; dragging = null; controller.setEnabled(true); renderer.domElement.releasePointerCapture?.(event.pointerId); }
  renderer.domElement.addEventListener('pointerdown', onPointerDown, { capture: true });
  renderer.domElement.addEventListener('pointermove', onPointerMove, { capture: true });
  renderer.domElement.addEventListener('pointerup', onPointerUp, { capture: true });
  renderer.domElement.addEventListener('pointercancel', onPointerUp, { capture: true });

  function charges(state) {
    return [
      { q: state.q1, position: normalizedToMeters(state.a, ARENA_METERS) },
      { q: state.q2, position: normalizedToMeters(state.b, ARENA_METERS) },
    ];
  }
  function redrawPotential(state) {
    const ctx = heatCanvas.getContext('2d'); const image = ctx.createImageData(heatCanvas.width, heatCanvas.height);
    const cs = charges(state);
    for (let y = 0; y < heatCanvas.height; y += 4) for (let x = 0; x < heatCanvas.width; x += 4) {
      const value = electricPotentialAt(cs, normalizedToMeters({ x: x / heatCanvas.width, y: y / heatCanvas.height }, ARENA_METERS));
      const n = Math.tanh(value / 18000); const r = n > 0 ? 255 : 45; const b = n < 0 ? 255 : 58; const g = 70 + Math.round((1 - Math.abs(n)) * 50); const a = 50 + Math.round(Math.abs(n) * 135);
      for (let oy = 0; oy < 4; oy += 1) for (let ox = 0; ox < 4; ox += 1) { const px = x + ox; const py = y + oy; if (px >= heatCanvas.width || py >= heatCanvas.height) continue; const i = (py * heatCanvas.width + px) * 4; image.data[i] = r; image.data[i + 1] = g; image.data[i + 2] = b; image.data[i + 3] = a; }
    }
    ctx.putImageData(image, 0, 0); heatTexture.needsUpdate = true;
  }

  runtime.start(() => {
    controller.update();
    const state = getState(); if (!state) return;
    const aWorld = toWorld(state.a); const bWorld = toWorld(state.b); const pWorld = toWorld(state.probe, .3);
    chargeA.position.set(aWorld.x, aWorld.y, aWorld.z); chargeB.position.set(bWorld.x, bWorld.y, bWorld.z); probe.position.set(pWorld.x, pWorld.y, pWorld.z);
    setChargeAppearance(THREE, chargeA, state.q1); setChargeAppearance(THREE, chargeB, state.q2);
    const interaction = state.interaction;
    if (interaction) {
      updateArrow(forceA, aWorld, interaction.forceOn1, .85); updateArrow(forceB, bWorld, interaction.forceOn2, .85);
    }
    const cs = charges(state);
    fieldArrows.forEach(({ arrow, nx, ny }) => {
      arrow.visible = state.showField;
      if (!state.showField) return;
      const field = electricFieldAt(cs, normalizedToMeters({ x: nx, y: ny }, ARENA_METERS));
      const origin = toWorld({ x: nx, y: ny }, .18); updateArrow(arrow, origin, { x: field.x, y: field.y }, .38);
    });
    heatPlane.visible = state.showPotential;
    const nextSignature = JSON.stringify([state.q1, state.q2, state.a.x.toFixed(3), state.a.y.toFixed(3), state.b.x.toFixed(3), state.b.y.toFixed(3), state.showPotential]);
    if (nextSignature !== signature) { signature = nextSignature; if (state.showPotential) redrawPotential(state); }
  });

  if (statusElement) statusElement.textContent = 'Cena 3D ativa · arraste cargas ou sonda';
  return () => {
    renderer.domElement.removeEventListener('pointerdown', onPointerDown, { capture: true });
    renderer.domElement.removeEventListener('pointermove', onPointerMove, { capture: true });
    renderer.domElement.removeEventListener('pointerup', onPointerUp, { capture: true });
    renderer.domElement.removeEventListener('pointercancel', onPointerUp, { capture: true });
    [chargeA, chargeB, probe].forEach((group) => group.traverse((object) => object.userData.disposeTexture?.dispose?.()));
    heatTexture.dispose(); controller.dispose(); runtime.dispose();
  };
}
