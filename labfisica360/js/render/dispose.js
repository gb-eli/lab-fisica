function disposeTexture(value, disposed) {
  if (!value?.isTexture || disposed.has(value)) return;
  disposed.add(value);
  value.dispose?.();
}

function disposeUniformValue(value, disposed) {
  if (!value) return;
  if (value.isTexture) disposeTexture(value, disposed);
  else if (Array.isArray(value)) value.forEach((item) => disposeUniformValue(item, disposed));
  else if (value.value) disposeUniformValue(value.value, disposed);
}

export function disposeMaterial(material, disposed = new Set()) {
  if (!material || disposed.has(material)) return;
  disposed.add(material);
  Object.values(material).forEach((value) => {
    if (value?.isTexture) disposeTexture(value, disposed);
  });
  if (material.uniforms) Object.values(material.uniforms).forEach((uniform) => disposeUniformValue(uniform, disposed));
  material.dispose?.();
}

export function disposeObject3D(root, { remove = false } = {}) {
  if (!root) return;
  const disposed = new Set();
  root.traverse?.((object) => {
    if (object.geometry && !disposed.has(object.geometry)) {
      disposed.add(object.geometry);
      object.geometry.dispose?.();
    }
    if (Array.isArray(object.material)) object.material.forEach((item) => disposeMaterial(item, disposed));
    else disposeMaterial(object.material, disposed);
    if (object.skeleton?.boneTexture) disposeTexture(object.skeleton.boneTexture, disposed);
    object.userData?.dispose?.();
  });
  if (remove) root.removeFromParent?.();
}
