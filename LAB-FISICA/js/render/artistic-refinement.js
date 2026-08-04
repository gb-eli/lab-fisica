function tuneMaterial(material, detailed) {
  if (!material || material.userData?.artisticRefined) return;
  material.userData = { ...(material.userData || {}), artisticRefined: true };
  if ('envMapIntensity' in material) material.envMapIntensity = Math.max(material.envMapIntensity || 1, detailed ? 1.28 : 1.02);
  if ('clearcoat' in material && detailed) material.clearcoat = Math.max(material.clearcoat || 0, material.metalness > 0.35 ? 0.28 : 0.12);
  if ('clearcoatRoughness' in material && detailed) material.clearcoatRoughness = Math.min(material.clearcoatRoughness ?? 0.3, 0.24);
  if ('specularIntensity' in material) material.specularIntensity = detailed ? 1 : 0.72;
  if ('ior' in material && material.transparent) material.ior = material.ior || 1.46;
  material.dithering = true;
  material.needsUpdate = true;
}

export function createArtisticRefinement({ THREE, scene, camera, renderer, getSettings = () => ({}), accent = 0x62dcff }) {
  const inspectionLight = new THREE.PointLight(accent, 0, 24, 2);
  inspectionLight.name = 'ART_INSPECTION_LIGHT';
  inspectionLight.position.set(1.2, 1.4, 2.6);
  camera.add(inspectionLight);
  if (!camera.parent) scene.add(camera);

  const warmFill = new THREE.DirectionalLight(0xffd8b5, 0);
  warmFill.name = 'ART_WARM_FILL';
  warmFill.position.set(-4, 6, 3);
  scene.add(warmFill);

  let lastDetailed = null;
  let lastLighting = null;

  function enhance(root = scene) {
    const settings = getSettings();
    const detailed = settings.surfaceDetail !== false;
    root.traverse?.((object) => {
      if (!object.isMesh) return;
      object.castShadow = Boolean(detailed && !object.material?.transparent && object.geometry?.attributes?.position?.count < 120000);
      object.receiveShadow = Boolean(detailed && !object.material?.transparent);
      const list = Array.isArray(object.material) ? object.material : [object.material];
      list.forEach((material) => tuneMaterial(material, detailed));
    });
  }

  function update() {
    const settings = getSettings();
    const detailed = settings.surfaceDetail !== false;
    const lighting = settings.inspectionLighting !== false;
    inspectionLight.intensity = lighting ? (detailed ? 3.1 : 1.8) : 0;
    warmFill.intensity = lighting ? 0.34 : 0;
    renderer.toneMappingExposure = detailed ? 1.12 : 1.03;
    if (detailed !== lastDetailed) {
      lastDetailed = detailed;
      enhance(scene);
    }
    lastLighting = lighting;
  }

  update();
  return {
    enhance,
    update,
    get state() { return { detailed: lastDetailed, inspectionLighting: lastLighting }; },
    dispose() {
      camera.remove(inspectionLight);
      scene.remove(warmFill);
      inspectionLight.dispose?.();
      warmFill.dispose?.();
    },
  };
}
