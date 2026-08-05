import { loadGlbLite } from './glb-loader-lite.js';
import { createTextureLibrary } from './texture-library.js';
import { createAssetFallback } from './procedural-fallbacks.js';
import { getQualityProfile } from '../quality.js';
import { disposeObject3D } from '../render/dispose.js';

const MANIFEST_URL = '../../assets/models/electrical/manifest.json';

export class AssetManager {
  constructor({ THREE, renderer, materials, manifestUrl = MANIFEST_URL }) {
    this.THREE = THREE;
    this.renderer = renderer;
    this.materials = materials;
    this.manifestUrl = new URL(manifestUrl, import.meta.url);
    this.manifest = null;
    this.textureLibrary = null;
    this.cache = new Map();
    this.sources = new Set();
    this.instances = new Set();
    this.abortController = new AbortController();
  }

  async initialize() {
    const response = await fetch(this.manifestUrl);
    if (!response.ok) throw new Error(`Manifesto 3D indisponível: ${response.status}`);
    this.manifest = await response.json();
    this.textureLibrary = await createTextureLibrary(this.THREE, this.renderer, this.manifest.textures);
    return this;
  }

  selectLod(asset, requested) {
    if (Number.isInteger(requested)) return asset.lods.find((entry) => entry.level === requested) || asset.lods.at(-1);
    const bias = getQualityProfile().lodBias || 0;
    return asset.lods.find((entry) => entry.level === Math.min(2, bias)) || asset.lods[0];
  }

  async load(id, { lod, clone = true } = {}) {
    if (!this.manifest) await this.initialize();
    const definition = this.manifest.assets[id];
    if (!definition) throw new Error(`Asset não registrado: ${id}`);
    const selected = this.selectLod(definition, lod);
    const key = `${id}:${selected.level}`;
    if (!this.cache.has(key)) {
      const url = new URL(`../../${selected.url}`, import.meta.url);
      this.cache.set(key, loadGlbLite(this.THREE, url.href, { signal: this.abortController.signal })
        .then((root) => {
          root.name = id;
          root.userData.assetId = id;
          root.userData.lod = selected.level;
          root.traverse((object) => {
            if (!object.isMesh) return;
            this.textureLibrary?.apply(object.material);
            object.userData.assetId = id;
          });
          this.sources.add(root);
          return root;
        })
        .catch((error) => {
          console.warn(`Fallback procedural para ${id}.`, error);
          return createAssetFallback(this.THREE, id, this.materials);
        }));
    }
    const source = await this.cache.get(key);
    const instance = clone ? source.clone(true) : source;
    if (clone) instance.traverse((object) => {
      if (!object.isMesh || !object.material) return;
      object.material = Array.isArray(object.material) ? object.material.map((material) => material.clone()) : object.material.clone();
    });
    instance.userData.assetId = id;
    instance.userData.assetLod = selected.level;
    if (clone) this.instances.add(instance);
    return instance;
  }

  async loadCollider(id) {
    if (!this.manifest) await this.initialize();
    const definition = this.manifest.assets[id];
    if (!definition?.collider) return null;
    const response = await fetch(new URL(`../../${definition.collider}`, import.meta.url));
    return response.ok ? response.json() : null;
  }

  async preload(ids) { return Promise.all(ids.map((id) => this.load(id, { clone: false }))); }

  preloadIdle(ids, { timeout = 1800 } = {}) {
    const run = () => this.preload(ids).catch((error) => console.warn('Pré-carregamento 3D interrompido.', error));
    if (typeof requestIdleCallback === 'function') return requestIdleCallback(run, { timeout });
    return setTimeout(run, Math.min(timeout, 500));
  }

  release(instance) {
    if (!instance || !this.instances.has(instance)) return false;
    this.instances.delete(instance);
    disposeObject3D(instance, { remove: true });
    return true;
  }

  getStats() {
    return { cached: this.cache.size, sources: this.sources.size, instances: this.instances.size };
  }

  dispose() {
    this.abortController.abort();
    this.instances.forEach((root) => disposeObject3D(root, { remove: true }));
    this.instances.clear();
    this.sources.forEach((root) => disposeObject3D(root));
    this.sources.clear();
    this.textureLibrary?.dispose();
    this.cache.clear();
  }
}
