export const ADAPTIVE_TIERS = Object.freeze({
  full: { particleRatio: 1, instanceRatio: 1, detailLevel: 3, postProcessing: true, shadows: true },
  balanced: { particleRatio: 0.82, instanceRatio: 0.9, detailLevel: 2, postProcessing: true, shadows: true },
  reduced: { particleRatio: 0.56, instanceRatio: 0.68, detailLevel: 1, postProcessing: false, shadows: true },
  minimal: { particleRatio: 0.32, instanceRatio: 0.42, detailLevel: 0, postProcessing: false, shadows: false },
});

function geometryCount(object) {
  const geometry = object.geometry;
  if (!geometry) return 0;
  if (geometry.index) return geometry.index.count;
  return geometry.attributes?.position?.count || 0;
}

export class AdaptiveSceneOptimizer {
  constructor({ scene, renderer, profile, onChange }) {
    this.scene = scene;
    this.renderer = renderer;
    this.profile = profile;
    this.onChange = onChange;
    this.tier = 'full';
    this.original = new WeakMap();
    this.stats = { pointsAdjusted: 0, instancesAdjusted: 0, detailsHidden: 0 };
  }

  remember(object) {
    if (this.original.has(object)) return this.original.get(object);
    const state = {
      visible: object.visible,
      count: object.count,
      drawStart: object.geometry?.drawRange?.start || 0,
      drawCount: object.geometry?.drawRange?.count,
    };
    this.original.set(object, state);
    return state;
  }

  apply(tier = 'full') {
    const selected = ADAPTIVE_TIERS[tier] || ADAPTIVE_TIERS.full;
    this.tier = ADAPTIVE_TIERS[tier] ? tier : 'full';
    const stats = { pointsAdjusted: 0, instancesAdjusted: 0, detailsHidden: 0 };

    this.scene.traverse((object) => {
      const original = this.remember(object);
      if (Number.isInteger(object.userData?.detailTier)) {
        object.visible = original.visible && object.userData.detailTier <= selected.detailLevel;
        if (!object.visible && original.visible) stats.detailsHidden += 1;
      }
      if (object.isPoints && object.geometry) {
        const count = geometryCount(object);
        object.geometry.setDrawRange(original.drawStart, Math.max(1, Math.floor(count * selected.particleRatio)));
        stats.pointsAdjusted += 1;
      }
      if (object.isInstancedMesh && Number.isFinite(original.count)) {
        object.count = Math.max(1, Math.floor(original.count * selected.instanceRatio));
        stats.instancesAdjusted += 1;
      }
      if (object.userData?.adaptiveEffect === 'optional') {
        object.visible = original.visible && selected.detailLevel >= 1;
      }
    });

    this.renderer.shadowMap.enabled = Boolean(this.profile.shadows && selected.shadows);
    this.stats = stats;
    this.onChange?.(this.getState());
    return this.getState();
  }

  update(report, enabled = true) {
    const next = enabled ? report?.adaptiveTier || 'full' : 'full';
    if (next !== this.tier) return this.apply(next);
    return this.getState();
  }

  restore() { return this.apply('full'); }

  getState() {
    return { tier: this.tier, ...ADAPTIVE_TIERS[this.tier], ...this.stats };
  }
}
