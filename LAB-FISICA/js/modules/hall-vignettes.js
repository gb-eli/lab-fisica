function emissiveMaterial(THREE, color, intensity = 1.4, opacity = 1) {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: intensity,
    metalness: 0.25,
    roughness: 0.24,
    transparent: opacity < 1,
    opacity,
  });
}

function lineMaterial(THREE, color, opacity = 0.58) {
  return new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false });
}

function createPedestal(THREE, color) {
  const group = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(1.28, 1.46, 0.2, 40),
    new THREE.MeshStandardMaterial({ color: 0x0b1723, metalness: 0.84, roughness: 0.24 }),
  );
  base.position.y = 0.1;
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.1, 0.025, 8, 64),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.72 }),
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.22;
  group.add(base, ring);
  return group;
}

function createCoulomb(THREE, color, detail) {
  const group = createPedestal(THREE, color);
  const positive = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 20), emissiveMaterial(THREE, 0xff526c, 1.2));
  const negative = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 20), emissiveMaterial(THREE, 0x53bfff, 1.2));
  positive.position.set(-0.78, 1.15, 0);
  negative.position.set(0.78, 1.15, 0);
  group.add(positive, negative);
  const fieldLines = [];
  const lineCount = detail >= 2 ? 10 : 6;
  for (let index = 0; index < lineCount; index += 1) {
    const points = [];
    const phase = index / lineCount * Math.PI * 2;
    for (let step = 0; step <= 32; step += 1) {
      const t = step / 32;
      const x = -0.62 + t * 1.24;
      const arc = Math.sin(t * Math.PI);
      points.push(new THREE.Vector3(x, 1.15 + Math.cos(phase) * arc * 0.65, Math.sin(phase) * arc * 0.65));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, lineMaterial(THREE, index % 2 ? 0x7bdcff : 0xff748a, 0.46));
    group.add(line);
    fieldLines.push(line);
  }
  return {
    group,
    update({ time, delta }) {
      positive.position.y = 1.15 + Math.sin(time * 1.4) * 0.035;
      negative.position.y = 1.15 + Math.sin(time * 1.4 + Math.PI) * 0.035;
      fieldLines.forEach((line, index) => { line.material.opacity = 0.32 + Math.sin(time * 1.8 + index) * 0.13; });
      group.rotation.y += delta * 0.06;
    },
  };
}

function createCircuit(THREE, color, detail) {
  const group = createPedestal(THREE, color);
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.12, 1.25),
    new THREE.MeshStandardMaterial({ color: 0x102532, metalness: 0.58, roughness: 0.34 }),
  );
  board.position.y = 0.42;
  group.add(board);
  const battery = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.68, 0.5), emissiveMaterial(THREE, 0x1b83b8, 0.5));
  battery.position.set(-0.65, 0.82, 0);
  const meter = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.55, 0.42), new THREE.MeshPhysicalMaterial({ color: 0x252f38, metalness: 0.46, roughness: 0.3 }));
  meter.position.set(0.65, 0.76, 0);
  const display = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.17), new THREE.MeshBasicMaterial({ color: 0x68f7c5 }));
  display.position.set(0.65, 0.8, -0.216);
  group.add(battery, meter, display);
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.65, 0.9, -0.28), new THREE.Vector3(-0.2, 1.12, -0.5),
    new THREE.Vector3(0.65, 0.9, -0.28), new THREE.Vector3(0.2, 0.55, 0.48),
    new THREE.Vector3(-0.65, 0.9, 0.28),
  ], true);
  const cable = new THREE.Mesh(new THREE.TubeGeometry(curve, detail >= 2 ? 64 : 32, 0.035, 8, true), new THREE.MeshStandardMaterial({ color: 0xff684d, roughness: 0.45 }));
  group.add(cable);
  const electrons = [];
  const electronCount = detail >= 2 ? 18 : 9;
  for (let index = 0; index < electronCount; index += 1) {
    const electron = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), emissiveMaterial(THREE, 0x65e6ff, 2.2));
    electron.userData.offset = index / electronCount;
    electrons.push(electron);
    group.add(electron);
  }
  return {
    group,
    update({ time }) {
      electrons.forEach((electron) => electron.position.copy(curve.getPoint((electron.userData.offset + time * 0.08) % 1)));
      display.material.color.setHSL(0.43, 0.88, 0.56 + Math.sin(time * 2) * 0.05);
    },
  };
}

function createEnergy(THREE, color, detail) {
  const group = createPedestal(THREE, color);
  const generator = new THREE.Group();
  generator.position.y = 1.05;
  const housing = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.66, 1.3, 32, 1, true), new THREE.MeshPhysicalMaterial({ color: 0x2c4d55, metalness: 0.8, roughness: 0.23, transparent: true, opacity: 0.38, side: THREE.DoubleSide }));
  housing.rotation.z = Math.PI / 2;
  const rotor = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 1.6, 24), emissiveMaterial(THREE, color, 0.85));
  rotor.rotation.z = Math.PI / 2;
  generator.add(housing, rotor);
  const blades = new THREE.Group();
  for (let index = 0; index < 6; index += 1) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 0.16), new THREE.MeshStandardMaterial({ color: 0xc8e9ef, metalness: 0.68, roughness: 0.24 }));
    blade.position.x = 0.28;
    blade.rotation.z = index / 6 * Math.PI * 2;
    blades.add(blade);
  }
  blades.rotation.y = Math.PI / 2;
  blades.position.x = -0.8;
  generator.add(blades);
  group.add(generator);
  const energyParticles = [];
  for (let index = 0; index < (detail >= 2 ? 16 : 8); index += 1) {
    const particle = new THREE.Mesh(new THREE.SphereGeometry(0.025, 7, 5), emissiveMaterial(THREE, color, 2));
    particle.userData.phase = index / 16 * Math.PI * 2;
    group.add(particle);
    energyParticles.push(particle);
  }
  return {
    group,
    update({ time, delta }) {
      rotor.rotation.x += delta * 2.2;
      blades.rotation.x += delta * 1.8;
      energyParticles.forEach((particle) => {
        const phase = particle.userData.phase + time * 0.9;
        particle.position.set(Math.cos(phase) * 0.9, 1.05 + Math.sin(phase * 2) * 0.35, Math.sin(phase) * 0.9);
      });
    },
  };
}

function createMagnetism(THREE, color, detail) {
  const group = createPedestal(THREE, color);
  const magnet = new THREE.Group();
  magnet.position.y = 1.05;
  const north = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.42, 0.42), emissiveMaterial(THREE, 0xff526c, 0.7));
  north.position.x = -0.42;
  const south = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.42, 0.42), emissiveMaterial(THREE, 0x537eff, 0.7));
  south.position.x = 0.42;
  magnet.add(north, south);
  group.add(magnet);
  const coils = [];
  for (let index = 0; index < (detail >= 2 ? 10 : 6); index += 1) {
    const coil = new THREE.Mesh(new THREE.TorusGeometry(0.55 + index * 0.035, 0.012, 6, 56), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.42 }));
    coil.rotation.y = Math.PI / 2;
    coil.position.y = 1.05;
    coil.scale.y = 1 + index * 0.11;
    group.add(coil);
    coils.push(coil);
  }
  const solenoid = new THREE.Group();
  solenoid.position.set(0, 1.05, 0.8);
  for (let index = 0; index < 8; index += 1) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.025, 8, 36), new THREE.MeshStandardMaterial({ color: 0xc87332, metalness: 0.75, roughness: 0.3 }));
    ring.rotation.y = Math.PI / 2;
    ring.position.x = (index - 3.5) * 0.12;
    solenoid.add(ring);
  }
  group.add(solenoid);
  return {
    group,
    update({ time, delta }) {
      magnet.rotation.y += delta * 0.18;
      coils.forEach((coil, index) => { coil.material.opacity = 0.25 + Math.sin(time * 1.6 + index * 0.4) * 0.12; });
      solenoid.rotation.y = Math.sin(time * 0.5) * 0.16;
    },
  };
}

function createMechanics(THREE, color, detail) {
  const group = createPedestal(THREE, color);
  const frame = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.1, 0.1), new THREE.MeshStandardMaterial({ color: 0x9aa9b6, metalness: 0.8, roughness: 0.24 }));
  frame.position.y = 2.05;
  group.add(frame);
  const pendulum = new THREE.Group();
  pendulum.position.y = 2.05;
  const string = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1.25, 8), new THREE.MeshBasicMaterial({ color: 0xdfefff }));
  string.position.y = -0.62;
  const bob = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 16), emissiveMaterial(THREE, color, 0.7));
  bob.position.y = -1.28;
  pendulum.add(string, bob);
  group.add(pendulum);
  const ramp = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.12, 0.72), new THREE.MeshStandardMaterial({ color: 0x234050, metalness: 0.55, roughness: 0.32 }));
  ramp.position.set(0.35, 0.68, 0.7);
  ramp.rotation.z = -0.28;
  const cart = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.22, 0.3), emissiveMaterial(THREE, 0xffbe58, 0.45));
  cart.position.set(0.1, 0.9, 0.7);
  group.add(ramp, cart);
  return {
    group,
    update({ time }) {
      pendulum.rotation.z = Math.sin(time * 1.35) * 0.52;
      const t = (Math.sin(time * 0.8) + 1) * 0.5;
      cart.position.x = -0.2 + t * 1.0;
      cart.position.y = 0.81 + t * 0.28;
    },
  };
}

function createWaves(THREE, color, detail) {
  const group = createPedestal(THREE, color);
  const columns = [];
  const count = detail >= 2 ? 36 : 22;
  for (let index = 0; index < count; index += 1) {
    const column = new THREE.Mesh(
      new THREE.BoxGeometry(0.035, 1, 0.08),
      new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.65, transparent: true, opacity: 0.72 }),
    );
    column.position.x = -1.05 + index / (count - 1) * 2.1;
    column.userData.phase = index / (count - 1) * Math.PI * 4;
    group.add(column);
    columns.push(column);
  }
  const lens = new THREE.Mesh(new THREE.SphereGeometry(0.38, 28, 18), new THREE.MeshPhysicalMaterial({ color: 0x83cfff, transmission: 0.78, transparent: true, opacity: 0.55, roughness: 0.08, thickness: 0.4 }));
  lens.scale.x = 0.35;
  lens.position.set(0, 1.22, 0.65);
  group.add(lens);
  return {
    group,
    update({ time }) {
      columns.forEach((column) => {
        const value = Math.sin(column.userData.phase - time * 2.2);
        column.scale.y = 0.15 + Math.abs(value) * 0.82;
        column.position.y = 0.35 + column.scale.y * 0.5;
        column.position.z = value * 0.3;
      });
      lens.rotation.y = time * 0.25;
    },
  };
}

function createThermal(THREE, color, detail) {
  const group = createPedestal(THREE, color);
  const vessel = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.58, 1.4, 40, 1, true), new THREE.MeshPhysicalMaterial({ color: 0x6edfff, transparent: true, opacity: 0.22, transmission: 0.5, roughness: 0.08, side: THREE.DoubleSide, depthWrite: false }));
  vessel.position.y = 1.02;
  const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.52, 0.75, 36), new THREE.MeshStandardMaterial({ color: 0x43a9e8, emissive: 0x1f79a8, emissiveIntensity: 0.5, transparent: true, opacity: 0.65 }));
  liquid.position.y = 0.72;
  group.add(vessel, liquid);
  const thermometer = new THREE.Group();
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.45, 10), new THREE.MeshStandardMaterial({ color: 0xe9f4f6, roughness: 0.38 }));
  stem.position.y = 1.35;
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 10), emissiveMaterial(THREE, 0xff684f, 1.4));
  bulb.position.y = 0.62;
  thermometer.position.x = 0.38;
  thermometer.add(stem, bulb);
  group.add(thermometer);
  const molecules = [];
  for (let index = 0; index < (detail >= 2 ? 24 : 12); index += 1) {
    const particle = new THREE.Mesh(new THREE.SphereGeometry(0.025, 7, 5), emissiveMaterial(THREE, index % 2 ? color : 0xffb25f, 1.8));
    particle.userData.seed = Math.random(); particle.userData.seed2 = Math.random(); particle.userData.seed3 = Math.random();
    group.add(particle); molecules.push(particle);
  }
  const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.12, 28), new THREE.MeshStandardMaterial({ color: 0xa8b9c0, metalness: 0.75, roughness: 0.24 }));
  piston.position.set(-0.85, 1.2, 0);
  group.add(piston);
  return {
    group,
    update({ time }) {
      const temperature = 0.5 + 0.5 * Math.sin(time * 0.8);
      liquid.material.color.setHSL(0.58 - temperature * 0.55, 0.86, 0.55);
      bulb.material.color.setHSL(0.12 - temperature * 0.1, 0.9, 0.55);
      piston.position.y = 1.05 + temperature * 0.55;
      molecules.forEach((particle, index) => {
        particle.position.set((particle.userData.seed - 0.5) * 1.0, 0.42 + particle.userData.seed2 * 0.78, (particle.userData.seed3 - 0.5) * 1.0);
        particle.position.y += Math.sin(time * (1.2 + temperature * 3) + index) * 0.055;
      });
    },
  };
}

function createAdvanced(THREE, color, detail) {
  const group = createPedestal(THREE, color);
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.42, 40, 24), new THREE.MeshBasicMaterial({ color: 0x000000 }));
  core.position.y = 1.18;
  group.add(core);
  const disk = new THREE.Mesh(
    new THREE.RingGeometry(0.52, 1.25, detail >= 2 ? 96 : 48),
    new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(color) } },
      vertexShader: 'varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader: 'varying vec2 vUv; uniform float uTime; uniform vec3 uColor; void main(){vec2 p=vUv-.5; float r=length(p); float a=atan(p.y,p.x); float bands=.55+.45*sin(r*70.-a*5.-uTime*3.); float alpha=smoothstep(.5,.18,r)*smoothstep(.08,.25,r); gl_FragColor=vec4(mix(vec3(1.,.38,.08),uColor,bands),alpha*.82);}',
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  disk.rotation.x = Math.PI / 2.25;
  disk.position.y = 1.18;
  group.add(disk);
  const lensRing = new THREE.Mesh(new THREE.TorusGeometry(0.54, 0.025, 8, 72), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 }));
  lensRing.position.y = 1.18;
  group.add(lensRing);
  const stars = [];
  for (let index = 0; index < (detail >= 2 ? 24 : 12); index += 1) {
    const star = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 4), emissiveMaterial(THREE, index % 2 ? color : 0xffffff, 2.5));
    star.userData.radius = 0.75 + Math.random() * 0.8;
    star.userData.phase = Math.random() * Math.PI * 2;
    star.userData.speed = 0.3 + Math.random() * 0.5;
    stars.push(star);
    group.add(star);
  }
  return {
    group,
    update({ time }) {
      disk.material.uniforms.uTime.value = time;
      lensRing.rotation.y = time * 0.5;
      stars.forEach((star) => {
        const phase = star.userData.phase + time * star.userData.speed;
        star.position.set(Math.cos(phase) * star.userData.radius, 1.18 + Math.sin(phase * 1.7) * 0.45, Math.sin(phase) * star.userData.radius);
      });
    },
  };
}

const factories = [createCoulomb, createCircuit, createEnergy, createMagnetism, createMechanics, createWaves, createThermal, createAdvanced];

export function createHallVignette(THREE, portal, index, detail = 1) {
  const factory = factories[index] || createAdvanced;
  const vignette = factory(THREE, portal.color, detail);
  vignette.group.name = `VIGNETTE_${portal.route}_${index}`;
  vignette.group.userData.portalIndex = index;
  return vignette;
}
