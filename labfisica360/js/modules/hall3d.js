import { icon } from '../ui/icons.js';
import { getQualityProfile } from '../quality.js';
import { createRenderRuntime } from '../render/runtime.js';
import { createOrbitController } from '../render/orbit-controller.js';
import { AssetManager } from '../assets/asset-manager.js';
import { createHallAudio } from './hall-audio.js';
import { createHallVignette } from './hall-vignettes.js';

const OVERVIEW_POSE = {
  yaw: 0.72,
  pitch: 0.24,
  radius: 24,
  target: { x: 0, y: 2.3, z: 0 },
};

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function easeInOutCubic(value) {
  return value < 0.5 ? 4 * value ** 3 : 1 - ((-2 * value + 2) ** 3) / 2;
}

function lerpAngle(from, to, amount) {
  let delta = (to - from) % (Math.PI * 2);
  if (delta > Math.PI) delta -= Math.PI * 2;
  if (delta < -Math.PI) delta += Math.PI * 2;
  return from + delta * amount;
}

function mixPose(from, to, amount) {
  return {
    yaw: lerpAngle(from.yaw, to.yaw, amount),
    pitch: from.pitch + (to.pitch - from.pitch) * amount,
    radius: from.radius + (to.radius - from.radius) * amount,
    target: {
      x: from.target.x + (to.target.x - from.target.x) * amount,
      y: from.target.y + (to.target.y - from.target.y) * amount,
      z: from.target.z + (to.target.z - from.target.z) * amount,
    },
  };
}

function createFloorTexture(THREE, profile) {
  const canvas = document.createElement('canvas');
  canvas.width = profile.textureTier === 'ultra' ? 1536 : 1024;
  canvas.height = canvas.width;
  const context = canvas.getContext('2d');
  const size = canvas.width;
  const center = size / 2;
  const gradient = context.createRadialGradient(center, center, 50, center, center, center);
  gradient.addColorStop(0, '#17394c');
  gradient.addColorStop(0.32, '#0c2231');
  gradient.addColorStop(0.72, '#07131e');
  gradient.addColorStop(1, '#02070c');
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);
  context.translate(center, center);
  context.strokeStyle = 'rgba(88,216,255,.18)';
  context.lineWidth = 2;
  for (let radius = size * 0.09; radius <= size * 0.49; radius += size * 0.055) {
    context.beginPath();
    context.arc(0, 0, radius, 0, Math.PI * 2);
    context.stroke();
  }
  for (let index = 0; index < 28; index += 1) {
    const angle = index / 28 * Math.PI * 2;
    context.beginPath();
    context.moveTo(Math.cos(angle) * size * 0.06, Math.sin(angle) * size * 0.06);
    context.lineTo(Math.cos(angle) * size * 0.49, Math.sin(angle) * size * 0.49);
    context.stroke();
  }
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.fillStyle = 'rgba(118,230,255,.035)';
  const tile = size / 18;
  for (let y = 0; y < size; y += tile) {
    for (let x = 0; x < size; x += tile) {
      if ((Math.round(x / tile) + Math.round(y / tile)) % 2 === 0) context.fillRect(x + 2, y + 2, tile - 4, tile - 4);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = profile.textureTier === 'ultra' ? 8 : 4;
  return texture;
}

function createWallTexture(THREE, color = '#17384b') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  const gradient = context.createLinearGradient(0, 0, 512, 512);
  gradient.addColorStop(0, '#07121c');
  gradient.addColorStop(0.48, color);
  gradient.addColorStop(1, '#03090e');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 512, 512);
  context.strokeStyle = 'rgba(154,229,255,.11)';
  context.lineWidth = 2;
  for (let y = 0; y <= 512; y += 64) {
    context.beginPath(); context.moveTo(0, y); context.lineTo(512, y); context.stroke();
  }
  for (let x = 0; x <= 512; x += 128) {
    context.beginPath(); context.moveTo(x, 0); context.lineTo(x, 512); context.stroke();
  }
  context.fillStyle = 'rgba(255,255,255,.025)';
  for (let y = 16; y < 512; y += 64) context.fillRect(8, y, 496, 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 1);
  return texture;
}

function createPortalMaterial(THREE, color) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uTime: { value: 0 },
      uStrength: { value: 1 },
      uSelected: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vPosition;
      void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      varying vec3 vPosition;
      uniform vec3 uColor;
      uniform float uTime;
      uniform float uStrength;
      uniform float uSelected;
      void main() {
        vec2 p = vUv - 0.5;
        float radius = length(p);
        float angle = atan(p.y, p.x);
        float rings = 0.5 + 0.5 * sin(radius * 48.0 - uTime * 2.8);
        float rays = 0.5 + 0.5 * sin(angle * 12.0 + uTime * 1.5);
        float turbulence = 0.5 + 0.5 * sin((p.x + p.y) * 35.0 + uTime * 2.0);
        float edge = smoothstep(0.5, 0.08, radius);
        float rim = smoothstep(0.5, 0.38, radius) - smoothstep(0.38, 0.25, radius);
        float core = smoothstep(0.30, 0.0, radius);
        float alpha = edge * (0.08 + rings * 0.12 + rays * 0.06 + turbulence * 0.035 + core * 0.09) * uStrength;
        alpha += rim * (0.2 + uSelected * 0.35);
        gl_FragColor = vec4(uColor * (0.65 + rings * 0.55 + uSelected * 0.35), alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
}

function createArchitecture({ THREE, world, profile, floorTexture, wallTexture }) {
  const emitters = [];
  const moving = [];
  const frameMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x102838,
    metalness: 0.88,
    roughness: 0.2,
    clearcoat: 0.35,
    clearcoatRoughness: 0.22,
  });
  const darkFrameMaterial = new THREE.MeshStandardMaterial({ color: 0x07141e, metalness: 0.82, roughness: 0.28 });
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x0e2533, map: wallTexture, metalness: 0.58, roughness: 0.34 });
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x4d9bb8,
    transparent: true,
    opacity: profile.architectureDetail >= 2 ? 0.17 : 0.1,
    transmission: profile.architectureDetail >= 2 ? 0.42 : 0,
    roughness: 0.15,
    metalness: 0.02,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const floor = new THREE.Mesh(
    new THREE.CylinderGeometry(17.6, 18.2, 0.6, profile.architectureDetail >= 2 ? 128 : 72),
    new THREE.MeshStandardMaterial({ color: 0x081721, map: floorTexture, metalness: 0.82, roughness: 0.23, envMapIntensity: 0.85 }),
  );
  floor.position.y = -0.36;
  floor.receiveShadow = true;
  world.add(floor);

  const lowerRing = new THREE.Mesh(new THREE.TorusGeometry(17.2, 0.16, 12, 160), frameMaterial);
  lowerRing.rotation.x = Math.PI / 2;
  lowerRing.position.y = -0.02;
  world.add(lowerRing);

  const atriumRing = new THREE.Mesh(
    new THREE.RingGeometry(4.1, 9.1, 112),
    new THREE.MeshPhysicalMaterial({ color: 0x102a38, metalness: 0.76, roughness: 0.22, clearcoat: 0.22, side: THREE.DoubleSide }),
  );
  atriumRing.rotation.x = -Math.PI / 2;
  atriumRing.position.y = -0.025;
  world.add(atriumRing);

  const centralDais = new THREE.Mesh(new THREE.CylinderGeometry(3.25, 3.55, 0.48, 80), frameMaterial);
  centralDais.position.y = 0.12;
  centralDais.castShadow = centralDais.receiveShadow = Boolean(profile.shadows);
  world.add(centralDais);

  const centralGlow = new THREE.Mesh(
    new THREE.RingGeometry(2.45, 3.06, 96),
    new THREE.MeshBasicMaterial({ color: 0x56ddff, transparent: true, opacity: 0.24, side: THREE.DoubleSide, depthWrite: false }),
  );
  centralGlow.rotation.x = -Math.PI / 2;
  centralGlow.position.y = 0.37;
  world.add(centralGlow);
  emitters.push({ object: centralGlow, base: 0.22, amount: 0.09, speed: 1.2, phase: 0 });

  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(18.05, profile.architectureDetail >= 2 ? 72 : 40, profile.architectureDetail >= 2 ? 28 : 16, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshPhysicalMaterial({
      color: 0x102d3c,
      metalness: 0.15,
      roughness: 0.36,
      transparent: true,
      opacity: profile.architectureDetail >= 2 ? 0.23 : 0.12,
      transmission: profile.architectureDetail >= 3 ? 0.22 : 0,
      side: THREE.BackSide,
      depthWrite: false,
    }),
  );
  dome.position.y = 0;
  world.add(dome);

  const ribCount = profile.architectureDetail >= 2 ? 24 : 14;
  for (let index = 0; index < ribCount; index += 1) {
    const angle = index / ribCount * Math.PI * 2;
    const rib = new THREE.Mesh(new THREE.TorusGeometry(17.8, 0.06, 8, 90, Math.PI / 2), darkFrameMaterial);
    rib.rotation.set(0, angle, Math.PI / 2);
    world.add(rib);
  }

  const ceilingRing = new THREE.Mesh(new THREE.TorusGeometry(13.1, 0.22, 16, 160), frameMaterial);
  ceilingRing.rotation.x = Math.PI / 2;
  ceilingRing.position.y = 7.9;
  world.add(ceilingRing);
  const ceilingEmitter = new THREE.Mesh(new THREE.TorusGeometry(12.75, 0.035, 8, 160), new THREE.MeshBasicMaterial({ color: 0x67e0ff, transparent: true, opacity: 0.62 }));
  ceilingEmitter.rotation.x = Math.PI / 2;
  ceilingEmitter.position.y = 7.88;
  world.add(ceilingEmitter);
  emitters.push({ object: ceilingEmitter, base: 0.5, amount: 0.16, speed: 0.65, phase: 1.3 });

  const catwalk = new THREE.Mesh(
    new THREE.RingGeometry(9.2, 12.2, 128),
    new THREE.MeshStandardMaterial({ color: 0x0c202c, metalness: 0.83, roughness: 0.27, side: THREE.DoubleSide }),
  );
  catwalk.rotation.x = -Math.PI / 2;
  catwalk.position.y = 4.1;
  world.add(catwalk);

  for (const radius of [9.3, 12.05]) {
    const rail = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.055, 8, 160), frameMaterial);
    rail.rotation.x = Math.PI / 2;
    rail.position.y = 4.8;
    world.add(rail);
  }

  const columnCount = profile.architectureDetail >= 2 ? 24 : 14;
  for (let index = 0; index < columnCount; index += 1) {
    const angle = index / columnCount * Math.PI * 2;
    const radius = 17.35;
    const column = new THREE.Mesh(new THREE.BoxGeometry(0.28, 7.2, 0.62), frameMaterial);
    column.position.set(Math.cos(angle) * radius, 3.25, Math.sin(angle) * radius);
    column.rotation.y = -angle;
    column.castShadow = Boolean(profile.shadows);
    world.add(column);
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.04, 5.8, 0.66), new THREE.MeshBasicMaterial({ color: 0x55dfff, transparent: true, opacity: 0.27 }));
    strip.position.set(Math.cos(angle) * (radius - 0.035), 3.35, Math.sin(angle) * (radius - 0.035));
    strip.rotation.y = -angle;
    world.add(strip);
    emitters.push({ object: strip, base: 0.22, amount: 0.1, speed: 0.8, phase: index * 0.39 });
  }

  const upperGlassCount = profile.architectureDetail >= 2 ? 14 : 8;
  for (let index = 0; index < upperGlassCount; index += 1) {
    const angle = index / upperGlassCount * Math.PI * 2;
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 2.8), glassMaterial.clone());
    panel.position.set(Math.cos(angle) * 17.65, 5.35, Math.sin(angle) * 17.65);
    panel.lookAt(0, 5.35, 0);
    world.add(panel);
  }

  const elevator = new THREE.Group();
  world.add(elevator);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(2.15, 2.15, 8.4, 48, 1, true), glassMaterial.clone());
  shaft.position.y = 4.35;
  elevator.add(shaft);
  const shaftFrameTop = new THREE.Mesh(new THREE.TorusGeometry(2.15, 0.11, 10, 72), frameMaterial);
  shaftFrameTop.rotation.x = Math.PI / 2;
  shaftFrameTop.position.y = 8.55;
  const shaftFrameBottom = shaftFrameTop.clone();
  shaftFrameBottom.position.y = 0.24;
  elevator.add(shaftFrameTop, shaftFrameBottom);
  const elevatorCar = new THREE.Group();
  const carFloor = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 1.65, 0.14, 48), frameMaterial);
  const carGlass = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.55, 1.25, 36, 1, true), glassMaterial.clone());
  carGlass.position.y = 0.68;
  elevatorCar.add(carFloor, carGlass);
  elevatorCar.position.y = 0.48;
  elevator.add(elevatorCar);
  moving.push({ type: 'elevator', object: elevatorCar });

  const wallSegments = profile.architectureDetail >= 1 ? 28 : 18;
  for (let index = 0; index < wallSegments; index += 1) {
    const angle = index / wallSegments * Math.PI * 2;
    const wall = new THREE.Mesh(new THREE.BoxGeometry(3.4, 3.5, 0.24), wallMaterial);
    wall.position.set(Math.cos(angle) * 17.55, 1.72, Math.sin(angle) * 17.55);
    wall.rotation.y = -angle;
    wall.receiveShadow = true;
    world.add(wall);
  }

  return { emitters, moving, materials: { frameMaterial, darkFrameMaterial, wallMaterial, glassMaterial } };
}

function createRoom({ THREE, portal, index, total, profile, materials }) {
  const angle = index / total * Math.PI * 2 - Math.PI / 2;
  const radial = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
  const roomRadius = 13.7;
  const group = new THREE.Group();
  group.name = `ROOM_${portal.title.toUpperCase().replace(/\s+/g, '_')}`;
  group.position.copy(radial).multiplyScalar(roomRadius);
  group.lookAt(0, 1.7, 0);

  const corridor = new THREE.Group();
  corridor.position.copy(radial).multiplyScalar(10.55);
  corridor.lookAt(0, 0, 0);
  const corridorFloor = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.16, 6.25),
    new THREE.MeshStandardMaterial({ color: 0x0b1d28, metalness: 0.78, roughness: 0.28 }),
  );
  corridorFloor.receiveShadow = true;
  corridor.add(corridorFloor);
  for (const x of [-1.08, 1.08]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.62, 6.1), materials.frameMaterial);
    rail.position.set(x, 0.43, 0);
    corridor.add(rail);
  }
  const corridorEmitter = new THREE.Mesh(
    new THREE.BoxGeometry(1.65, 0.018, 5.8),
    new THREE.MeshBasicMaterial({ color: portal.color, transparent: true, opacity: 0.18 }),
  );
  corridorEmitter.position.y = 0.1;
  corridor.add(corridorEmitter);

  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(5.4, 0.22, 5.1),
    new THREE.MeshPhysicalMaterial({ color: 0x0b1c26, metalness: 0.76, roughness: 0.24, clearcoat: 0.24 }),
  );
  floor.position.y = 0.02;
  floor.receiveShadow = true;
  group.add(floor);

  const backWall = new THREE.Mesh(new THREE.BoxGeometry(5.4, 4.2, 0.24), materials.wallMaterial.clone());
  backWall.position.set(0, 2.1, 2.45);
  backWall.castShadow = backWall.receiveShadow = Boolean(profile.shadows);
  group.add(backWall);
  for (const x of [-2.58, 2.58]) {
    const side = new THREE.Mesh(new THREE.BoxGeometry(0.24, 4.2, 5.0), materials.wallMaterial.clone());
    side.position.set(x, 2.1, 0);
    side.castShadow = side.receiveShadow = Boolean(profile.shadows);
    group.add(side);
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 2.0), materials.glassMaterial.clone());
    glass.position.set(x + (x < 0 ? 0.125 : -0.125), 2.25, 0);
    glass.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2;
    group.add(glass);
  }
  const roof = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.2, 5.1), materials.frameMaterial);
  roof.position.y = 4.18;
  group.add(roof);

  const ceilingPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(3.8, 1.8),
    new THREE.MeshBasicMaterial({ color: portal.color, transparent: true, opacity: portal.active ? 0.12 : 0.055, side: THREE.DoubleSide }),
  );
  ceilingPanel.rotation.x = Math.PI / 2;
  ceilingPanel.position.set(0, 4.05, 0);
  group.add(ceilingPanel);

  const roomLight = new THREE.PointLight(portal.color, portal.active ? 8 : 3, 7, 2);
  roomLight.position.set(0, 3.15, 0.4);
  group.add(roomLight);

  const portalFrame = new THREE.Group();
  portalFrame.position.set(0, 0, -2.46);
  group.add(portalFrame);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.62, 1.88, 0.22, 48), materials.frameMaterial);
  base.position.y = 0.08;
  base.castShadow = base.receiveShadow = Boolean(profile.shadows);
  portalFrame.add(base);
  const arch = new THREE.Mesh(
    new THREE.TorusGeometry(1.22, 0.115, 12, 72),
    new THREE.MeshPhysicalMaterial({
      color: portal.color,
      emissive: portal.color,
      emissiveIntensity: portal.active ? 1.4 : 0.42,
      metalness: 0.55,
      roughness: 0.2,
      clearcoat: 0.45,
      transparent: true,
      opacity: portal.active ? 0.96 : 0.65,
    }),
  );
  arch.position.y = 1.52;
  portalFrame.add(arch);
  const membrane = new THREE.Mesh(new THREE.CircleGeometry(1.1, 64), createPortalMaterial(THREE, portal.color));
  membrane.position.set(0, 1.52, 0.01);
  membrane.userData.portalIndex = index;
  portalFrame.add(membrane);
  const beacon = new THREE.PointLight(portal.color, portal.active ? 12 : 3, 5.5, 2);
  beacon.position.y = 1.52;
  portalFrame.add(beacon);

  const sign = new THREE.Group();
  sign.position.set(0, 3.55, 2.27);
  const signBack = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.68, 0.08), materials.darkFrameMaterial);
  const signLight = new THREE.Mesh(new THREE.PlaneGeometry(3.35, 0.45), new THREE.MeshBasicMaterial({ color: portal.color, transparent: true, opacity: 0.2, side: THREE.DoubleSide }));
  signLight.position.z = -0.045;
  sign.add(signBack, signLight);
  group.add(sign);

  const vignette = createHallVignette(THREE, portal, index, profile.architectureDetail);
  vignette.group.position.set(0, 0.22, 0.45);
  vignette.group.scale.setScalar(0.92);
  group.add(vignette.group);

  const sectorParticles = [];
  const particleCount = profile.architectureDetail >= 2 ? 13 : 7;
  for (let particleIndex = 0; particleIndex < particleCount; particleIndex += 1) {
    const particle = new THREE.Mesh(
      new THREE.SphereGeometry(0.018 + (particleIndex % 3) * 0.006, 6, 4),
      new THREE.MeshBasicMaterial({ color: portal.color, transparent: true, opacity: 0.75, depthWrite: false }),
    );
    particle.userData.phase = particleIndex / particleCount * Math.PI * 2;
    particle.userData.radius = 1.2 + (particleIndex % 4) * 0.18;
    particle.position.y = 1.3;
    group.add(particle);
    sectorParticles.push(particle);
  }

  return {
    portal,
    index,
    angle,
    radial,
    group,
    corridor,
    arch,
    membrane,
    roomLight,
    signLight,
    vignette,
    sectorParticles,
    worldTarget: new THREE.Vector3().copy(radial).multiplyScalar(roomRadius).setY(1.55),
  };
}

function createAmbientParticles(THREE, profile) {
  const count = Math.max(160, Math.round(profile.particles * 0.72));
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const color = new THREE.Color();
  for (let index = 0; index < count; index += 1) {
    const radius = 3.2 + Math.random() * 14.5;
    const angle = Math.random() * Math.PI * 2;
    positions[index * 3] = Math.cos(angle) * radius;
    positions[index * 3 + 1] = 0.35 + Math.random() * 8.8;
    positions[index * 3 + 2] = Math.sin(angle) * radius;
    color.setHSL(0.52 + Math.random() * 0.1, 0.72, 0.55 + Math.random() * 0.25);
    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const points = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({ size: profile.architectureDetail >= 2 ? 0.042 : 0.032, vertexColors: true, transparent: true, opacity: 0.46, depthWrite: false }),
  );
  return points;
}

function createCoreAndMap(THREE, portals, profile) {
  const group = new THREE.Group();
  group.position.y = 2.2;
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.86, profile.architectureDetail >= 2 ? 4 : 2),
    new THREE.MeshPhysicalMaterial({
      color: 0x43cfff,
      emissive: 0x164fd1,
      emissiveIntensity: 2.1,
      transmission: profile.architectureDetail >= 2 ? 0.28 : 0,
      transparent: true,
      opacity: 0.92,
      roughness: 0.12,
      metalness: 0.04,
      clearcoat: 0.7,
    }),
  );
  const coreLight = new THREE.PointLight(0x45d8ff, 35, 17, 2);
  group.add(core, coreLight);
  const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x63e6ff, transparent: true, opacity: 0.56 });
  const rings = [
    new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.022, 8, 80), ringMaterial.clone()),
    new THREE.Mesh(new THREE.TorusGeometry(1.65, 0.018, 8, 80), ringMaterial.clone()),
    new THREE.Mesh(new THREE.TorusGeometry(1.95, 0.014, 8, 80), ringMaterial.clone()),
  ];
  rings[0].rotation.x = 1.05;
  rings[1].rotation.set(0.35, 1.2, 0.2);
  rings[2].rotation.set(1.4, 0.3, 0.8);
  group.add(...rings);

  const map = new THREE.Group();
  map.name = 'HOLOGRAPHIC_MAP';
  map.position.y = 1.75;
  map.visible = false;
  const mapRing = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.025, 8, 96), new THREE.MeshBasicMaterial({ color: 0x6ce5ff, transparent: true, opacity: 0.55 }));
  mapRing.rotation.x = Math.PI / 2;
  map.add(mapRing);
  portals.forEach((portal, index) => {
    const angle = index / portals.length * Math.PI * 2 - Math.PI / 2;
    const node = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 10), new THREE.MeshBasicMaterial({ color: portal.color, transparent: true, opacity: portal.active ? 0.95 : 0.45 }));
    node.position.set(Math.cos(angle) * 2.4, 0, Math.sin(angle) * 2.4);
    node.userData.portalIndex = index;
    map.add(node);
    const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), node.position.clone()]);
    const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: portal.color, transparent: true, opacity: 0.35 }));
    map.add(line);
  });
  group.add(map);
  return { group, core, rings, map };
}

async function addElectricalAssetPreview({ THREE, room, runtime, profile }) {
  if (profile.architectureDetail < 1) return null;
  const assetManager = new AssetManager({ THREE, renderer: runtime.renderer, materials: runtime.materials });
  try {
    await assetManager.initialize();
    const preview = new THREE.Group();
    preview.name = 'ELECTRICAL_ASSET_PREVIEW';
    preview.position.set(0, 0.2, 0.35);
    const lod = profile.architectureDetail >= 3 ? 1 : 2;
    const [bench, supply, meter, lamp] = await Promise.all([
      assetManager.load('workbench', { lod }),
      assetManager.load('power-supply', { lod }),
      assetManager.load('multimeter', { lod }),
      assetManager.load('lamp-load', { lod }),
    ]);
    bench.scale.setScalar(0.42);
    bench.position.set(0, -0.65, 0.35);
    supply.scale.setScalar(0.46);
    supply.position.set(-0.65, 0.35, 0.1);
    meter.scale.setScalar(0.43);
    meter.position.set(0.55, 0.35, 0.18);
    lamp.scale.setScalar(0.48);
    lamp.position.set(1.0, 0.3, -0.35);
    preview.add(bench, supply, meter, lamp);
    room.vignette.group.visible = false;
    room.group.add(preview);
    return { assetManager, preview };
  } catch (error) {
    console.warn('Prévia GLB do setor elétrico não pôde ser carregada.', error);
    assetManager.dispose();
    return null;
  }
}

export async function mountHall3D({
  container,
  labelsLayer,
  portals,
  navigate,
  statusElement,
  getSettings,
  onSectorChange = () => {},
  controlsRoot = container,
}) {
  if (!container || !labelsLayer) return () => {};
  const settings = getSettings();
  const runtime = await createRenderRuntime({
    container,
    statusElement,
    getSettings,
    canvasClass: 'hall-webgl',
    fallbackClass: 'hall-stage--fallback',
    camera: { fov: 47, near: 0.08, far: 115 },
    scene: { background: 0x01050a, fogColor: 0x020a12, fogDensity: 0.014, exposure: 1.08 },
    environment: { upper: '#071722', horizon: '#2787a3', lower: '#010408', accent: '#70e7ff' },
  });
  if (!runtime) return () => {};
  const { THREE, scene, camera, renderer } = runtime;
  const profile = getQualityProfile();
  const world = new THREE.Group();
  world.name = 'HALL_PREMIUM_WORLD';
  scene.add(world);

  const floorTexture = createFloorTexture(THREE, profile);
  const wallTexture = createWallTexture(THREE);
  const architecture = createArchitecture({ THREE, world, profile, floorTexture, wallTexture });

  scene.add(new THREE.HemisphereLight(0x9ce7ff, 0x07111f, 1.55));
  const keyLight = new THREE.DirectionalLight(0xc7efff, 2.2);
  keyLight.position.set(8, 14, 7);
  keyLight.castShadow = Boolean(profile.shadows);
  keyLight.shadow.mapSize.set(profile.shadowMapSize, profile.shadowMapSize);
  keyLight.shadow.camera.near = 1;
  keyLight.shadow.camera.far = 48;
  keyLight.shadow.camera.left = -19;
  keyLight.shadow.camera.right = 19;
  keyLight.shadow.camera.top = 19;
  keyLight.shadow.camera.bottom = -19;
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0x6b79ff, 0.8);
  fillLight.position.set(-10, 5, -8);
  scene.add(fillLight);

  const core = createCoreAndMap(THREE, portals, profile);
  world.add(core.group);
  const ambientParticles = createAmbientParticles(THREE, profile);
  world.add(ambientParticles);

  const rooms = portals.map((portal, index) => createRoom({ THREE, portal, index, total: portals.length, profile, materials: architecture.materials }));
  rooms.forEach((room) => {
    world.add(room.corridor);
    world.add(room.group);
  });

  let disposed = false;
  let electricalPreview = null;
  addElectricalAssetPreview({ THREE, room: rooms[1], runtime, profile }).then((preview) => {
    if (disposed) preview?.assetManager?.dispose();
    else electricalPreview = preview;
  });

  const portalLabels = [];
  rooms.forEach((room) => {
    const label = document.createElement('button');
    label.className = `hall-portal-label ${room.portal.active ? 'is-active' : 'is-planned'}`;
    label.dataset.portalIndex = String(room.index);
    label.innerHTML = `${icon(room.portal.icon, 'ui-icon')}<b>${room.portal.title}</b><small>${room.portal.subtitle}</small>`;
    label.setAttribute('aria-label', `${room.portal.title}: ${room.portal.subtitle}`);
    label.addEventListener('click', () => {
      if (room.portal.active) navigate(room.portal.route);
      else focusSector(room.index, { guided: true });
    });
    labelsLayer.append(label);
    portalLabels.push({ element: label, room });
  });

  const controller = createOrbitController({
    element: renderer.domElement,
    camera,
    target: OVERVIEW_POSE.target,
    yaw: OVERVIEW_POSE.yaw,
    pitch: OVERVIEW_POSE.pitch,
    radius: OVERVIEW_POSE.radius,
    minRadius: 4.2,
    maxRadius: 31,
    minPitch: -0.2,
    maxPitch: 0.72,
    heightFactor: 0.72,
    sensitivity: 0.0046,
  });
  runtime.bindCameraController(controller);

  const audio = createHallAudio({ getSettings });
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let pointerDown = null;
  let selectedSector = -1;
  let navigationMode = 'overview';
  let autoTour = !settings.reduceMotion;
  let mapVisible = false;
  let transition = null;
  let guidedElapsed = 0;

  function poseForSector(index) {
    const room = rooms[index];
    return {
      yaw: -Math.PI / 2 - room.angle,
      pitch: 0.07,
      radius: 5.65,
      target: { x: room.worldTarget.x, y: room.worldTarget.y, z: room.worldTarget.z },
    };
  }

  function beginTransition(endPose, duration = 1.05) {
    transition = {
      from: controller.state,
      to: endPose,
      elapsed: 0,
      duration: getSettings().reduceMotion ? 0.02 : duration,
    };
    controller.setEnabled(false);
  }

  function syncSelection() {
    rooms.forEach((room) => {
      const selected = room.index === selectedSector;
      room.membrane.material.uniforms.uSelected.value = selected ? 1 : 0;
      room.roomLight.visible = selected || room.index < profile.maxDynamicLights;
      room.roomLight.intensity = selected ? (room.portal.active ? 15 : 7) : (room.portal.active ? 7 : 2.5);
      room.signLight.material.opacity = selected ? 0.34 : (room.portal.active ? 0.16 : 0.07);
      room.arch.material.emissiveIntensity = selected ? 2.3 : (room.portal.active ? 1.35 : 0.4);
    });
    portalLabels.forEach(({ element, room }) => element.classList.toggle('is-selected', room.index === selectedSector));
    container.querySelectorAll('[data-hall-sector]').forEach((button) => button.classList.toggle('is-selected', Number(button.dataset.hallSector) === selectedSector));
    if (selectedSector >= 0) {
      const room = rooms[selectedSector];
      audio.setSector(room.group.position, selectedSector);
      onSectorChange(room.portal, selectedSector);
    }
  }

  function focusSector(index, { guided = false } = {}) {
    const normalized = (index + rooms.length) % rooms.length;
    selectedSector = normalized;
    navigationMode = guided ? 'guided' : navigationMode;
    autoTour = false;
    guidedElapsed = 0;
    beginTransition(poseForSector(normalized));
    syncSelection();
    syncControls();
  }

  function showOverview() {
    navigationMode = 'overview';
    selectedSector = -1;
    guidedElapsed = 0;
    beginTransition(OVERVIEW_POSE, 1.2);
    syncSelection();
    syncControls();
    onSectorChange(null, -1);
  }

  function nextSector(direction = 1) {
    const next = selectedSector < 0 ? 0 : (selectedSector + direction + rooms.length) % rooms.length;
    focusSector(next, { guided: true });
  }

  function toggleMap(force) {
    mapVisible = typeof force === 'boolean' ? force : !mapVisible;
    core.map.visible = mapVisible;
    container.classList.toggle('is-map-open', mapVisible);
    const mapPanel = container.querySelector('[data-hall-map-panel]');
    if (mapPanel) mapPanel.hidden = !mapVisible;
    controlsRoot.querySelectorAll('[data-hall-map]').forEach((button) => {
      button.classList.toggle('is-active', mapVisible);
      button.setAttribute('aria-expanded', String(mapVisible));
    });
  }

  async function toggleFullscreen() {
    if (document.fullscreenElement === container) await document.exitFullscreen();
    else if (container.requestFullscreen) await container.requestFullscreen();
    else container.classList.toggle('is-immersive');
  }

  async function toggleAudio() {
    const enabled = await audio.toggle();
    const button = container.querySelector('[data-hall-audio]');
    if (button) {
      button.classList.toggle('is-active', enabled);
      button.setAttribute('aria-pressed', String(enabled));
      const label = button.querySelector('.hall-control-label');
      if (label) label.textContent = enabled ? 'Áudio ativo' : 'Áudio ambiente';
    }
  }

  function syncControls() {
    const autoButton = container.querySelector('[data-hall-auto]');
    const walkButton = container.querySelector('[data-hall-walk]');
    if (autoButton) {
      autoButton.classList.toggle('is-active', autoTour);
      autoButton.setAttribute('aria-pressed', String(autoTour));
      const label = autoButton.querySelector('.hall-control-label');
      if (label) label.textContent = autoTour ? 'Pausar câmera' : 'Câmera automática';
    }
    if (walkButton) {
      walkButton.classList.toggle('is-active', navigationMode === 'guided');
      walkButton.setAttribute('aria-pressed', String(navigationMode === 'guided'));
      const label = walkButton.querySelector('.hall-control-label');
      if (label) label.textContent = navigationMode === 'guided' ? 'Sair do passeio' : 'Passeio guiado';
    }
    container.classList.toggle('is-guided', navigationMode === 'guided');
  }

  function onControlClick(event) {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.matches('[data-hall-auto]')) {
      autoTour = !autoTour;
      navigationMode = 'overview';
      if (selectedSector >= 0) showOverview();
      syncControls();
    } else if (button.matches('[data-hall-reset]')) {
      autoTour = false;
      showOverview();
    } else if (button.matches('[data-hall-walk]')) {
      if (navigationMode === 'guided') showOverview();
      else focusSector(selectedSector >= 0 ? selectedSector : 0, { guided: true });
    } else if (button.matches('[data-hall-prev]')) {
      nextSector(-1);
    } else if (button.matches('[data-hall-next]')) {
      nextSector(1);
    } else if (button.matches('[data-hall-map]')) {
      toggleMap();
    } else if (button.matches('[data-hall-audio]')) {
      toggleAudio();
    } else if (button.matches('[data-hall-fullscreen]')) {
      toggleFullscreen();
    } else if (button.matches('[data-hall-sector]')) {
      focusSector(Number(button.dataset.hallSector), { guided: true });
      if (mapVisible && innerWidth < 760) toggleMap(false);
    } else if (button.matches('[data-hall-enter-sector]') && selectedSector >= 0) {
      const portal = rooms[selectedSector].portal;
      if (portal.active) navigate(portal.route);
    }
  }

  function projectLabels() {
    const rect = container.getBoundingClientRect();
    portalLabels.forEach(({ element, room }) => {
      const point = new THREE.Vector3();
      room.group.localToWorld(point.set(0, 4.45, -0.45));
      point.project(camera);
      const visible = point.z < 1 && Math.abs(point.x) < 1.1 && Math.abs(point.y) < 1.15;
      const compactOverview = innerWidth < 980 || getSettings().experienceMode === 'guided';
      element.hidden = !visible || (selectedSector >= 0 && selectedSector !== room.index) || (selectedSector < 0 && compactOverview);
      if (!visible) return;
      element.style.transform = `translate(-50%, -50%) translate(${(point.x * 0.5 + 0.5) * rect.width}px, ${(-point.y * 0.5 + 0.5) * rect.height}px)`;
      element.style.zIndex = String(Math.max(1, Math.round((1 - point.z) * 10)));
    });
  }

  function onPointerDown(event) {
    pointerDown = { x: event.clientX, y: event.clientY, time: performance.now() };
  }

  function onPointerUp(event) {
    if (!pointerDown) return;
    const distance = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y);
    const elapsed = performance.now() - pointerDown.time;
    pointerDown = null;
    if (distance > 7 || elapsed > 650) return;
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(rooms.map((room) => room.membrane), false);
    const index = intersects[0]?.object?.userData?.portalIndex;
    if (!Number.isInteger(index)) return;
    if (selectedSector === index && rooms[index].portal.active) navigate(rooms[index].portal.route);
    else focusSector(index, { guided: true });
  }

  controlsRoot.addEventListener('click', onControlClick);
  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('pointerup', onPointerUp);
  const onFullscreenChange = () => container.classList.toggle('is-fullscreen', document.fullscreenElement === container);
  document.addEventListener('fullscreenchange', onFullscreenChange);
  syncControls();
  syncSelection();

  runtime.start(({ delta, time }) => {
    const reduced = getSettings().reduceMotion;
    if (transition) {
      transition.elapsed += delta;
      const progress = clamp(transition.elapsed / transition.duration, 0, 1);
      controller.setPose(mixPose(transition.from, transition.to, easeInOutCubic(progress)));
      if (progress >= 1) {
        transition = null;
        controller.setEnabled(true);
      }
    } else {
      if (autoTour && !controller.isInteracting && navigationMode === 'overview' && !reduced) controller.rotate(delta * 0.055);
      controller.update();
    }

    if (navigationMode === 'guided' && !transition && !reduced) {
      guidedElapsed += delta;
      if (guidedElapsed > 12 && autoTour) nextSector(1);
    }

    if (!reduced) {
      core.core.rotation.y += delta * 0.26;
      core.core.rotation.x += delta * 0.08;
      core.rings[0].rotation.z += delta * 0.31;
      core.rings[1].rotation.y -= delta * 0.24;
      core.rings[2].rotation.x += delta * 0.2;
      core.group.position.y = Math.sin(time * 0.72) * 0.08;
      core.map.rotation.y += delta * 0.16;
      ambientParticles.rotation.y += delta * 0.009;
      architecture.moving.forEach((item) => {
        if (item.type === 'elevator') item.object.position.y = 0.48 + (Math.sin(time * 0.24) + 1) * 1.76;
      });
    }

    architecture.emitters.forEach(({ object, base, amount, speed, phase }) => {
      object.material.opacity = base + Math.sin(time * speed + phase) * amount;
    });

    rooms.forEach((room) => {
      const selected = room.index === selectedSector;
      room.membrane.material.uniforms.uTime.value = time + room.index * 0.75;
      room.membrane.material.uniforms.uStrength.value = room.portal.active ? (selected ? 1.18 : 0.82) : 0.28;
      const pulse = 1 + Math.sin(time * 1.45 + room.index) * (selected ? 0.04 : 0.015);
      room.arch.scale.setScalar(pulse);
      room.vignette.update({ time, delta, selected });
      room.sectorParticles.forEach((particle) => {
        const phase = particle.userData.phase + time * (0.35 + room.index * 0.035);
        particle.position.set(
          Math.cos(phase) * particle.userData.radius,
          1.15 + Math.sin(phase * 1.7) * 0.58,
          0.5 + Math.sin(phase) * particle.userData.radius,
        );
        particle.material.opacity = selected ? 0.92 : 0.42;
      });
    });

    audio.updateListener(camera);
    projectLabels();
  });

  return () => {
    disposed = true;
    controller.dispose();
    audio.dispose();
    electricalPreview?.assetManager?.dispose();
    portalLabels.forEach(({ element }) => element.remove());
    controlsRoot.removeEventListener('click', onControlClick);
    renderer.domElement.removeEventListener('pointerdown', onPointerDown);
    renderer.domElement.removeEventListener('pointerup', onPointerUp);
    document.removeEventListener('fullscreenchange', onFullscreenChange);
    floorTexture.dispose();
    wallTexture.dispose();
    runtime.dispose();
  };
}
