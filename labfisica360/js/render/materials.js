export function createMaterialLibrary(THREE, { accent = 0x52d9ff } = {}) {
  const common = { envMapIntensity: 1.25, dithering: true };
  return {
    metal(color = 0x152c3b, options = {}) {
      return new THREE.MeshPhysicalMaterial({ color, metalness: 0.88, roughness: 0.2, clearcoat: 0.2, clearcoatRoughness: 0.28, specularIntensity: 1, ...common, ...options });
    },
    coatedMetal(color = 0x16394d, options = {}) {
      return new THREE.MeshPhysicalMaterial({ color, metalness: 0.74, roughness: 0.18, clearcoat: 0.82, clearcoatRoughness: 0.14, specularIntensity: 1, ...common, ...options });
    },
    glass(color = accent, options = {}) {
      return new THREE.MeshPhysicalMaterial({ color, transparent: true, opacity: 0.18, transmission: 0.62, thickness: 0.22, ior: 1.46, attenuationColor: new THREE.Color(color), attenuationDistance: 2.8, roughness: 0.08, metalness: 0, depthWrite: false, side: THREE.DoubleSide, envMapIntensity: 1.32, dithering: true, ...options });
    },
    ceramic(color = 0xd6e2e8, options = {}) {
      return new THREE.MeshPhysicalMaterial({ color, metalness: 0.02, roughness: 0.42, clearcoat: 0.28, clearcoatRoughness: 0.32, specularIntensity: 0.72, ...common, ...options });
    },
    polymer(color = 0x17222b, options = {}) {
      return new THREE.MeshPhysicalMaterial({ color, metalness: 0.05, roughness: 0.54, clearcoat: 0.16, clearcoatRoughness: 0.38, specularIntensity: 0.62, ...common, ...options });
    },
    rubber(color = 0x101418, options = {}) {
      return new THREE.MeshPhysicalMaterial({ color, metalness: 0, roughness: 0.88, clearcoat: 0.02, sheen: 0.12, sheenColor: new THREE.Color(0x32404a), ...common, ...options });
    },
    screen(color = accent, options = {}) {
      return new THREE.MeshPhysicalMaterial({ color: 0x071116, emissive: color, emissiveIntensity: 1.55, metalness: 0.18, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05, iridescence: 0.18, ...common, ...options });
    },
    label(color = 0xe8f4f7, options = {}) {
      return new THREE.MeshPhysicalMaterial({ color, metalness: 0.02, roughness: 0.7, clearcoat: 0.08, polygonOffset: true, polygonOffsetFactor: -1, ...common, ...options });
    },
    warning(options = {}) {
      return new THREE.MeshPhysicalMaterial({ color: 0xf2b632, emissive: 0x4b2600, emissiveIntensity: 0.14, metalness: 0.04, roughness: 0.58, clearcoat: 0.12, ...common, ...options });
    },
    emissive(color = accent, options = {}) {
      return new THREE.MeshPhysicalMaterial({ color, emissive: color, emissiveIntensity: 1.75, metalness: 0.18, roughness: 0.18, clearcoat: 0.45, clearcoatRoughness: 0.12, ...common, ...options });
    },
  };
}
