export function createAssetFallback(THREE, assetId, materials) {
  const group = new THREE.Group();
  group.name = `fallback-${assetId}`;
  const polymer = materials?.polymer?.(0x202c35) || new THREE.MeshStandardMaterial({ color: 0x202c35, roughness: 0.6 });
  const metal = materials?.metal?.(0x71828b) || new THREE.MeshStandardMaterial({ color: 0x71828b, metalness: 0.8, roughness: 0.3 });
  const sizes = {
    workbench: [4.8, 2, 2], 'power-supply': [1.5, .85, 1.1], multimeter: [.9, 1.4, .3],
    'resistor-module': [1.4, .6, .8], 'toggle-switch': [.6, .9, .5], 'lamp-load': [.7, 1.1, .6],
    ammeter: [1.02, .72, .38], voltmeter: [1.02, .72, .38], 'fuse-module': [1.02, .58, .54],
    rheostat: [1.35, .95, .70], 'diode-module': [1.05, .62, .55], 'led-module': [.78, .75, .58],
  };
  const size = sizes[assetId] || [1, 1, 1];
  const body = new THREE.Mesh(new THREE.BoxGeometry(...size), polymer);
  body.position.y = size[1] * .5;
  body.castShadow = body.receiveShadow = true;
  group.add(body);
  const marker = new THREE.Mesh(new THREE.TorusGeometry(Math.min(size[0], size[1]) * .18, .025, 8, 32), metal);
  marker.position.set(0, size[1] * .62, size[2] * .52);
  group.add(marker);
  group.userData.fallback = true;
  return group;
}
