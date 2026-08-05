export class SnapSystem {
  constructor(THREE, { enabled = true, distance = 0.32, angleStep = Math.PI / 12 } = {}) {
    this.THREE = THREE;
    this.enabled = enabled;
    this.distance = distance;
    this.angleStep = angleStep;
    this.zones = [];
  }

  register({ id, position, rotationY = 0, accepts = [], label = id }) {
    this.zones.push({ id, position: new this.THREE.Vector3(...position), rotationY, accepts, label });
  }

  setEnabled(value) { this.enabled = Boolean(value); }

  nearest(object) {
    if (!this.enabled) return null;
    const assetId = object.userData.assetId;
    let best = null;
    for (const zone of this.zones) {
      if (zone.accepts.length && !zone.accepts.includes(assetId)) continue;
      const distance = object.position.distanceTo(zone.position);
      if (distance <= this.distance && (!best || distance < best.distance)) best = { ...zone, distance };
    }
    return best;
  }

  apply(object) {
    const zone = this.nearest(object);
    if (!zone) return null;
    object.position.copy(zone.position);
    object.rotation.y = zone.rotationY;
    object.updateMatrixWorld(true);
    return zone;
  }

  quantizeRotation(object) {
    if (!this.enabled) return;
    object.rotation.y = Math.round(object.rotation.y / this.angleStep) * this.angleStep;
    object.updateMatrixWorld(true);
  }
}
