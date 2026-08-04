function buildCurve(THREE, points) {
  return new THREE.CatmullRomCurve3(points.map((point) => point.isVector3 ? point.clone() : new THREE.Vector3(...point)), false, 'centripetal');
}

export function createCableSystem(THREE, {
  points,
  color = 0xc62f35,
  radius = 0.025,
  segments = 96,
  particles = 14,
  particleColor = 0xffdf82,
} = {}) {
  const group = new THREE.Group();
  let curve = buildCurve(THREE, points);
  const cableMaterial = new THREE.MeshPhysicalMaterial({ color, roughness: .68, metalness: .02, clearcoat: .18, clearcoatRoughness: .4 });
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, segments, radius, 10, false), cableMaterial);
  mesh.castShadow = true;
  group.add(mesh);
  const currentMaterial = new THREE.MeshBasicMaterial({ color: particleColor, transparent: true, opacity: 0, toneMapped: false });
  const beadGeometry = new THREE.SphereGeometry(radius * 1.38, 8, 8);
  const beads = Array.from({ length: particles }, (_, index) => {
    const bead = new THREE.Mesh(beadGeometry, currentMaterial.clone());
    bead.userData.phase = index / particles;
    group.add(bead);
    return bead;
  });

  function setPoints(nextPoints) {
    curve = buildCurve(THREE, nextPoints);
    const oldGeometry = mesh.geometry;
    mesh.geometry = new THREE.TubeGeometry(curve, segments, radius, 10, false);
    oldGeometry.dispose();
  }

  return {
    group,
    setPoints,
    setActive(active) { beads.forEach((bead) => { bead.material.opacity = active ? .9 : 0; }); },
    update(time, speed = .2) {
      beads.forEach((bead) => bead.position.copy(curve.getPointAt((bead.userData.phase + time * speed) % 1)));
    },
    dispose() {
      mesh.geometry.dispose(); cableMaterial.dispose(); beadGeometry.dispose(); currentMaterial.dispose();
      beads.forEach((bead) => bead.material.dispose());
    },
  };
}

export function createDynamicCableSystem(THREE, options = {}) {
  const start = new THREE.Vector3(-.5, 0, 0);
  const end = new THREE.Vector3(.5, 0, 0);
  let signature = '';
  const cable = createCableSystem(THREE, { ...options, points: [start, new THREE.Vector3(-.15, .35, .1), new THREE.Vector3(.15, .35, .1), end] });
  return {
    ...cable,
    setEndpoints(nextStart, nextEnd) {
      const nextSignature = `${nextStart.x.toFixed(3)}:${nextStart.y.toFixed(3)}:${nextStart.z.toFixed(3)}:${nextEnd.x.toFixed(3)}:${nextEnd.y.toFixed(3)}:${nextEnd.z.toFixed(3)}`;
      if (nextSignature === signature) return;
      signature = nextSignature;
      const distance = nextStart.distanceTo(nextEnd);
      const lift = Math.min(.72, .18 + distance * .18);
      const direction = nextEnd.clone().sub(nextStart);
      const p1 = nextStart.clone().addScaledVector(direction, .28); p1.y += lift;
      const p2 = nextStart.clone().addScaledVector(direction, .72); p2.y += lift;
      cable.setPoints([nextStart, p1, p2, nextEnd]);
    },
  };
}
