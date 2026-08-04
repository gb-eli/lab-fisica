function axisMaterial(THREE, color) {
  return new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .94, depthTest: false, toneMapped: false });
}

export function createTransformGizmo(THREE) {
  const group = new THREE.Group();
  group.name = 'UNIVERSAL_TRANSFORM_GIZMO';
  group.visible = false;
  group.renderOrder = 50;
  const handles = [];
  const colors = { x: 0xff5a68, y: 0x77ed8a, z: 0x52a7ff };

  function createAxis(axis) {
    const material = axisMaterial(THREE, colors[axis]);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(.022, .022, .72, 10), material);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(.075, .2, 12), material);
    shaft.position.y = .36;
    cone.position.y = .82;
    const root = new THREE.Group();
    root.name = `GIZMO_MOVE_${axis.toUpperCase()}`;
    root.userData.gizmoAxis = axis;
    root.userData.gizmoType = 'move';
    root.add(shaft, cone);
    if (axis === 'x') root.rotation.z = -Math.PI / 2;
    if (axis === 'z') root.rotation.x = Math.PI / 2;
    root.traverse((object) => { object.renderOrder = 50; object.userData.gizmoRoot = root; });
    group.add(root);
    handles.push(root);
  }

  createAxis('x'); createAxis('y'); createAxis('z');
  const ringMaterial = axisMaterial(THREE, 0xffcf62);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.68, .025, 10, 64), ringMaterial);
  ring.rotation.x = Math.PI / 2;
  ring.name = 'GIZMO_ROTATE_Y';
  ring.userData.gizmoAxis = 'y';
  ring.userData.gizmoType = 'rotate';
  ring.userData.gizmoRoot = ring;
  ring.renderOrder = 50;
  group.add(ring);
  handles.push(ring);

  const center = new THREE.Mesh(new THREE.SphereGeometry(.075, 14, 14), axisMaterial(THREE, 0xffffff));
  center.name = 'GIZMO_MOVE_FREE';
  center.userData.gizmoAxis = 'free';
  center.userData.gizmoType = 'move';
  center.userData.gizmoRoot = center;
  center.renderOrder = 50;
  group.add(center);
  handles.push(center);

  return {
    group,
    handles,
    setTarget(object) {
      if (!object) { group.visible = false; return; }
      const box = new THREE.Box3().setFromObject(object);
      box.getCenter(group.position);
      group.position.y = Math.max(group.position.y, box.max.y + .08);
      group.visible = true;
    },
    setMode(mode) {
      handles.forEach((handle) => {
        const expected = handle.userData.gizmoType;
        handle.visible = mode === 'select' ? false : (mode === expected || (mode === 'move' && expected === 'move'));
      });
    },
    updateScale(camera) {
      if (!group.visible) return;
      const distance = camera.position.distanceTo(group.position);
      group.scale.setScalar(Math.max(.42, Math.min(1.15, distance * .085)));
    },
    dispose() {
      group.traverse((object) => {
        object.geometry?.dispose?.();
        object.material?.dispose?.();
      });
    },
  };
}
