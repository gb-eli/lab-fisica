function loadTexture(THREE, url) {
  return new Promise((resolve, reject) => new THREE.TextureLoader().load(url, resolve, undefined, reject));
}

export async function createTextureLibrary(THREE, renderer, definitions = {}) {
  const maxAnisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy?.() || 1);
  const library = new Map();
  await Promise.all(Object.entries(definitions).map(async ([name, definition]) => {
    const preset = {};
    for (const [property, url] of Object.entries({ map: definition.baseColor, roughnessMap: definition.roughness, normalMap: definition.normal })) {
      if (!url) continue;
      try {
        const texture = await loadTexture(THREE, new URL(`../../${url}`, import.meta.url).href);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(...(definition.repeat || [1, 1]));
        texture.anisotropy = maxAnisotropy;
        if (property === 'map') texture.colorSpace = THREE.SRGBColorSpace;
        preset[property] = texture;
      } catch (error) {
        console.warn(`Textura opcional não carregada: ${url}`, error);
      }
    }
    library.set(name, preset);
  }));
  return {
    apply(material) {
      const preset = library.get(material.name);
      if (!preset) return material;
      Object.assign(material, preset);
      material.needsUpdate = true;
      return material;
    },
    dispose() {
      library.forEach((preset) => Object.values(preset).forEach((texture) => texture?.dispose?.()));
      library.clear();
    },
  };
}
